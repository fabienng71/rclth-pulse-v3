import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useDebounce } from '@/hooks/useDebounce';
import {
  ItemAnalytics,
  ItemsV2Filters,
  ItemsV2SortOptions,
  ItemsV2ViewConfig,
  ItemsV2DashboardStats,
  ItemsV2DataResponse,
  ItemsV2Error,
  ItemsV2LoadingState,
  ItemSalesMetrics,
  ItemInventoryIntel
} from '@/types/itemsV2';

interface UseItemsV2DataOptions {
  page?: number;
  pageSize?: number;
  initialFilters?: ItemsV2Filters;
  initialSort?: ItemsV2SortOptions;
  initialView?: ItemsV2ViewConfig;
  enableRealTime?: boolean;
}

export const useItemsV2Data = (options: UseItemsV2DataOptions = {}) => {
  const {
    page = 1,
    pageSize = 50,
    initialFilters = {},
    initialSort = { field: 'performance_score', direction: 'desc' },
    initialView = { layout: 'cards', card_size: 'standard', show_charts: true, show_metrics: true, show_actions: true },
    enableRealTime = false
  } = options;

  const { profile, isAdmin } = useAuthStore();
  const [filters, setFilters] = useState<ItemsV2Filters>(initialFilters);
  const [sortOptions, setSortOptions] = useState<ItemsV2SortOptions>(initialSort);
  const [viewConfig, setViewConfig] = useState<ItemsV2ViewConfig>(initialView);
  const [searchTerm, setSearchTerm] = useState(filters.search_term || '');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Loading states for different sections
  const [loadingState, setLoadingState] = useState<ItemsV2LoadingState>({
    items: false,
    dashboard_stats: false,
    analytics: false,
    export: false,
    search: false
  });

  // Enhanced filters including debounced search
  const enhancedFilters = useMemo(() => ({
    ...filters,
    search_term: debouncedSearchTerm
  }), [filters, debouncedSearchTerm]);

  // Fetch enhanced items data with analytics
  const { data: itemsData, isLoading: isLoadingItems, error: itemsError, refetch } = useQuery({
    queryKey: ['itemsV2Data', enhancedFilters, page, pageSize, sortOptions, profile?.spp_code, isAdmin],
    queryFn: async (): Promise<ItemsV2DataResponse> => {
      setLoadingState(prev => ({ ...prev, items: true }));
      
      try {
        // Use the new RPC function for enhanced analytics with proper margin calculation
        const dateFrom = enhancedFilters.date_range?.[0] || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 12 months ago
        const dateTo = enhancedFilters.date_range?.[1] || new Date();
        
        // Apply item code filtering if search term exists
        let itemCodes: string[] | null = null;
        if (enhancedFilters.search_term?.trim()) {
          // First get matching item codes from search
          const searchQuery = supabase
            .from('items')
            .select('item_code')
            .or(`item_code.ilike.%${enhancedFilters.search_term.trim()}%,description.ilike.%${enhancedFilters.search_term.trim()}%,brand.ilike.%${enhancedFilters.search_term.trim()}%`);
          
          const { data: searchResults } = await searchQuery;
          itemCodes = searchResults?.map(item => item.item_code) || [];
          
          if (itemCodes.length === 0) {
            // No items match search, return empty result
            return {
              items: [],
              dashboard_stats: createEmptyDashboardStats(),
              pagination: {
                page,
                page_size: pageSize,
                total_count: 0,
                total_pages: 0,
                has_next: false,
                has_previous: false
              },
              applied_filters: enhancedFilters,
              execution_time_ms: 0,
              cache_hit: false
            };
          }
        }

        // Call the new RPC function with enhanced analytics
        const { data: rpcData, error: rpcError, count } = await supabase
          .rpc('get_items_with_sales_metrics', {
            p_date_from: dateFrom.toISOString().split('T')[0],
            p_date_to: dateTo.toISOString().split('T')[0],
            p_salesperson_code: !isAdmin && profile?.spp_code ? profile.spp_code : null,
            p_item_codes: itemCodes,
            p_limit: pageSize,
            p_offset: (page - 1) * pageSize
          });

        if (rpcError) {
          throw new Error(`Failed to fetch items analytics: ${rpcError.message}`);
        }

        const items = rpcData || [];

        // Map RPC data to ItemAnalytics format
        const itemAnalytics: ItemAnalytics[] = items.map((rpcItem: any) => {
          // Create sales metrics from RPC data
          const salesMetrics: ItemSalesMetrics = {
            item_code: rpcItem.item_code,
            total_sales_amount: rpcItem.total_sales_amount || 0,
            total_quantity_sold: rpcItem.total_quantity_sold || 0,
            avg_selling_price: rpcItem.avg_selling_price || 0,
            total_orders: rpcItem.total_orders || 0,
            unique_customers: rpcItem.unique_customers || 0,
            sales_velocity: rpcItem.sales_velocity || 0,
            margin_amount: rpcItem.margin_amount || 0,
            margin_percent: rpcItem.margin_percent || 0,
            commission_amount: rpcItem.commission_amount || 0,
            last_sale_date: rpcItem.last_sale_date ? new Date(rpcItem.last_sale_date) : null,
            first_sale_date: rpcItem.first_sale_date ? new Date(rpcItem.first_sale_date) : null,
            peak_sales_month: rpcItem.peak_sales_month || null,
            sales_trend: rpcItem.sales_trend || 'stable',
            performance_rating: rpcItem.performance_rating || 'low'
          };

          // Create inventory intel from RPC data
          const inventoryIntel: ItemInventoryIntel = {
            item_code: rpcItem.item_code,
            current_stock: rpcItem.current_stock || 0,
            reorder_point: Math.max(10, (rpcItem.current_stock || 0) * 0.2),
            max_stock_level: (rpcItem.current_stock || 0) * 2,
            days_of_supply: rpcItem.days_of_supply || 0,
            stock_status: rpcItem.stock_status || 'critical',
            turnover_ratio: 0, // Placeholder for future enhancement
            last_restock_date: null,
            next_reorder_suggestion: null,
            stock_value: (rpcItem.current_stock || 0) * (rpcItem.unit_price || 0)
          };

          return {
            // Basic item properties
            item_code: rpcItem.item_code,
            description: rpcItem.description,
            unit_price: rpcItem.unit_price,
            base_unit_code: rpcItem.base_unit_code,
            posting_group: rpcItem.posting_group,
            vendor_code: rpcItem.vendor_code,
            brand: rpcItem.brand,
            attribut_1: rpcItem.attribut_1,
            pricelist: rpcItem.pricelist,
            
            // Enhanced properties from RPC
            sales_velocity: salesMetrics.sales_velocity,
            margin_percent: salesMetrics.margin_percent,
            last_sale_date: salesMetrics.last_sale_date,
            stock_quantity: inventoryIntel.current_stock,
            reorder_level: inventoryIntel.reorder_point,
            commission_rate: 0.05, // Default 5% - should come from config
            demand_trend: salesMetrics.sales_trend,
            
            // Analytics data
            sales_metrics: salesMetrics,
            inventory_intel: inventoryIntel,
            
            // Calculated insights from RPC
            overall_performance_score: rpcItem.performance_score || 0,
            sales_forecast_30_days: salesMetrics.sales_velocity * 30,
            margin_optimization_potential: Math.max(0, 40 - salesMetrics.margin_percent),
            commission_impact: salesMetrics.commission_amount,
            priority_level: rpcItem.priority_level || 'low',
            recommended_actions: generateRecommendedActions(salesMetrics, inventoryIntel),
            
            // Cost data from RPC (Phase 3 enhancement)
            cogs_unit: rpcItem.cogs_unit || null,
            cogs_available: rpcItem.cogs_available || false
          };
        });

        // Apply post-processing filters and sorting
        const filteredAndSortedItems = applyAdvancedFiltersAndSort(itemAnalytics, enhancedFilters, sortOptions);

        // For RPC functions, we estimate the total count based on the result size
        // This is a limitation since RPC doesn't provide exact count like regular queries
        const estimatedTotalCount = items.length === pageSize ? (page * pageSize) + 1 : ((page - 1) * pageSize) + items.length;

        // Generate dashboard stats
        const dashboardStats = generateDashboardStats(filteredAndSortedItems, estimatedTotalCount);

        return {
          items: filteredAndSortedItems,
          dashboard_stats: dashboardStats,
          pagination: {
            page,
            page_size: pageSize,
            total_count: estimatedTotalCount,
            total_pages: Math.ceil(estimatedTotalCount / pageSize),
            has_next: items.length === pageSize, // If we got a full page, assume there might be more
            has_previous: page > 1
          },
          applied_filters: enhancedFilters,
          execution_time_ms: Date.now() % 1000, // Mock execution time
          cache_hit: false
        };

      } catch (error) {
        console.error('Error fetching items v2 data:', error);
        throw error;
      } finally {
        setLoadingState(prev => ({ ...prev, items: false }));
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  // Simplified helper functions since most data now comes from RPC

  // Utility functions
  const createDefaultSalesMetrics = (itemCode: string): ItemSalesMetrics => ({
    item_code: itemCode,
    total_sales_amount: 0,
    total_quantity_sold: 0,
    avg_selling_price: 0,
    total_orders: 0,
    unique_customers: 0,
    sales_velocity: 0,
    margin_amount: 0,
    margin_percent: 0,
    commission_amount: 0,
    last_sale_date: null,
    first_sale_date: null,
    peak_sales_month: null,
    sales_trend: 'stable',
    performance_rating: 'low'
  });

  const createDefaultInventoryIntel = (itemCode: string): ItemInventoryIntel => ({
    item_code: itemCode,
    current_stock: 0,
    reorder_point: 10,
    max_stock_level: 100,
    days_of_supply: 0,
    stock_status: 'critical',
    turnover_ratio: 0,
    last_restock_date: null,
    next_reorder_suggestion: null,
    stock_value: 0
  });

  const createEmptyDashboardStats = (): ItemsV2DashboardStats => ({
    total_items: 0,
    top_performers: 0,
    avg_margin: 0,
    quick_wins: 0,
    total_sales_value: 0,
    commission_earned: 0,
    items_sold_today: 0,
    low_stock_alerts: 0,
    sales_trend_7_days: 'stable',
    margin_trend_7_days: 'stable',
    new_items_this_month: 0,
    best_performing_category: null,
    items_with_cogs: 0,
    cogs_coverage_percent: 0
  });

  // Performance calculation helpers (now using RPC data)

  // Simplified helper functions since most calculations are now done in RPC
  const generateRecommendedActions = (sales: ItemSalesMetrics, inventory: ItemInventoryIntel): string[] => {
    const actions: string[] = [];
    if (inventory.stock_status === 'critical') actions.push('Reorder immediately');
    if (sales.margin_percent < 20) actions.push('Review pricing strategy');
    if (sales.sales_velocity > 5) actions.push('Consider bulk discount promotion');
    if (sales.total_sales_amount === 0) actions.push('Promote to generate sales');
    return actions;
  };

  const applyAdvancedFiltersAndSort = (items: ItemAnalytics[], filters: ItemsV2Filters, sort: ItemsV2SortOptions): ItemAnalytics[] => {
    let filtered = [...items];

    // Apply basic attribute filters
    if (filters.categories?.length) {
      filtered = filtered.filter(item => 
        item.posting_group && filters.categories!.includes(item.posting_group)
      );
    }

    if (filters.brands?.length) {
      filtered = filtered.filter(item => 
        item.brand && filters.brands!.includes(item.brand)
      );
    }

    if (filters.vendors?.length) {
      filtered = filtered.filter(item => 
        item.vendor_code && filters.vendors!.includes(item.vendor_code)
      );
    }

    // Apply price range filter
    if (filters.price_range) {
      filtered = filtered.filter(item => {
        const price = item.unit_price || 0;
        return price >= filters.price_range![0] && price <= filters.price_range![1];
      });
    }

    // Apply stock status filter
    if (filters.stock_status?.length) {
      filtered = filtered.filter(item => 
        filters.stock_status!.includes(item.inventory_intel.stock_status)
      );
    }

    // Apply performance filters
    if (filters.performance_rating?.length) {
      filtered = filtered.filter(item => filters.performance_rating!.includes(item.sales_metrics.performance_rating));
    }

    // Apply sales trend filter
    if (filters.sales_trend?.length) {
      filtered = filtered.filter(item => filters.sales_trend!.includes(item.sales_metrics.sales_trend));
    }

    if (filters.margin_range) {
      filtered = filtered.filter(item => 
        item.sales_metrics.margin_percent >= filters.margin_range![0] &&
        item.sales_metrics.margin_percent <= filters.margin_range![1]
      );
    }

    // Apply date filters
    if (filters.last_sale_after) {
      filtered = filtered.filter(item => {
        if (!item.sales_metrics.last_sale_date) return false;
        return item.sales_metrics.last_sale_date >= filters.last_sale_after!;
      });
    }

    // Apply boolean filters
    if (filters.my_top_performers) {
      filtered = filtered.filter(item => item.sales_metrics.performance_rating === 'high');
    }

    if (filters.quick_wins) {
      filtered = filtered.filter(item => 
        item.sales_metrics.margin_percent > 30 && item.sales_metrics.sales_velocity > 2
      );
    }

    if (filters.customer_favorites) {
      filtered = filtered.filter(item => item.sales_metrics.unique_customers > 5);
    }

    if (filters.has_reorder_alert) {
      filtered = filtered.filter(item => 
        item.inventory_intel.stock_status === 'critical' || item.inventory_intel.stock_status === 'low'
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'performance_score':
          aValue = a.overall_performance_score;
          bValue = b.overall_performance_score;
          break;
        case 'sales_velocity':
          aValue = a.sales_metrics.sales_velocity;
          bValue = b.sales_metrics.sales_velocity;
          break;
        case 'margin_percent':
          aValue = a.sales_metrics.margin_percent;
          bValue = b.sales_metrics.margin_percent;
          break;
        case 'total_sales':
          aValue = a.sales_metrics.total_sales_amount;
          bValue = b.sales_metrics.total_sales_amount;
          break;
        case 'commission_impact':
          aValue = a.commission_impact;
          bValue = b.commission_impact;
          break;
        default:
          aValue = a[sort.field as keyof ItemAnalytics];
          bValue = b[sort.field as keyof ItemAnalytics];
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const generateDashboardStats = (items: ItemAnalytics[], totalCount: number): ItemsV2DashboardStats => {
    const topPerformers = items.filter(item => item.sales_metrics.performance_rating === 'high').length;
    const quickWins = items.filter(item => 
      item.sales_metrics.margin_percent > 30 && item.sales_metrics.sales_velocity > 2
    ).length;
    const avgMargin = items.length > 0 
      ? items.reduce((sum, item) => sum + item.sales_metrics.margin_percent, 0) / items.length 
      : 0;
    const totalSalesValue = items.reduce((sum, item) => sum + item.sales_metrics.total_sales_amount, 0);
    const commissionEarned = items.reduce((sum, item) => sum + item.commission_impact, 0);
    const lowStockAlerts = items.filter(item => item.inventory_intel.stock_status === 'critical').length;
    
    // Phase 3: Calculate COGS coverage metrics
    const itemsWithCogs = items.filter(item => item.cogs_available).length;
    const cogsCoveragePercent = items.length > 0 ? (itemsWithCogs / items.length) * 100 : 0;

    return {
      total_items: totalCount,
      top_performers: topPerformers,
      avg_margin: Math.round(avgMargin * 100) / 100,
      quick_wins: quickWins,
      total_sales_value: Math.round(totalSalesValue),
      commission_earned: Math.round(commissionEarned),
      items_sold_today: Math.floor(Math.random() * 50), // Mock data
      low_stock_alerts: lowStockAlerts,
      sales_trend_7_days: 'stable',
      margin_trend_7_days: 'stable',
      new_items_this_month: Math.floor(Math.random() * 20),
      best_performing_category: items.length > 0 ? items[0].posting_group : null,
      
      // Phase 3: COGS coverage metrics
      items_with_cogs: itemsWithCogs,
      cogs_coverage_percent: Math.round(cogsCoveragePercent * 100) / 100
    };
  };

  return {
    // Data
    items: itemsData?.items || [],
    dashboardStats: itemsData?.dashboard_stats || createEmptyDashboardStats(),
    pagination: itemsData?.pagination || {
      page: 1,
      page_size: pageSize,
      total_count: 0,
      total_pages: 0,
      has_next: false,
      has_previous: false
    },

    // State
    filters: enhancedFilters,
    sortOptions,
    viewConfig,
    searchTerm,
    loadingState,

    // Loading and error states
    isLoading: isLoadingItems,
    error: itemsError,

    // Actions
    setFilters,
    setSortOptions,
    setViewConfig,
    setSearchTerm,
    refetch,

    // Utility functions
    resetFilters: () => setFilters({}),
    exportData: async (config: any) => {
      setLoadingState(prev => ({ ...prev, export: true }));
      // TODO: Implement export functionality
      setTimeout(() => setLoadingState(prev => ({ ...prev, export: false })), 2000);
    }
  };
};