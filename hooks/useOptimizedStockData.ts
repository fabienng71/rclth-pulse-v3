import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { useLastMonthConsumption } from './useLastMonthConsumption';

export interface StockItem {
  item_code: string;
  description: string | null;
  posting_group: string | null;
  quantity: number;
  adjusted_quantity: number;
  category_description?: string | null;
  base_unit_code: string | null;
  unit_price: number | null;
  stock_value: number;
  last_month_consumption: number;
  days_of_stock: number;
  stock_status: 'critical' | 'low' | 'normal' | 'unknown';
  vendor_code: string | null;
  vendor_name: string | null;
}

export interface VendorGroup {
  vendor_code: string | null;
  vendor_name: string | null;
  items: StockItem[];
  total_value: number;
  total_items: number;
  critical_items: number;
}

export interface GroupedStockItems {
  [key: string]: {
    category_description: string | null;
    vendors: VendorGroup[];
    total_value: number;
    total_items: number;
    critical_items: number;
  };
}

export interface StockFilters {
  hideZeroStock: boolean;
  showOnlyCriticalAndLow: boolean;
}

export const useOptimizedStockData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [stockFilters, setStockFilters] = useState<StockFilters>({
    hideZeroStock: false,
    showOnlyCriticalAndLow: false
  });

  // Use materialized view for optimal performance
  const { data: stockData, isLoading, error, refetch } = useQuery({
    queryKey: ['optimizedStockData', debouncedSearchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_summary_view')
        .select('*')
        .order('item_code');
        
      if (error) {
        throw new Error(`Failed to fetch stock data: ${error.message}`);
      }
      
      return data?.map(item => ({
        item_code: item.item_code,
        description: item.description,
        posting_group: item.posting_group,
        base_unit_code: item.base_unit_code,
        unit_price: item.unit_price,
        vendor_code: item.vendor_code,
        quantity: item.quantity ?? 0,
        adjusted_quantity: item.adjusted_quantity ?? 0,
        category_description: item.category_description,
        vendor_name: item.vendor_name,
        stock_value: item.stock_value ?? 0,
        last_month_consumption: 0,
        days_of_stock: 0,
        stock_status: 'unknown' as const
      })) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const itemCodes = useMemo(() => {
    return stockData?.map(item => item.item_code) || [];
  }, [stockData]);
  
  const { data: consumptionData, isLoading: isLoadingConsumption } = useLastMonthConsumption(itemCodes);

  // Enhanced stock data with consumption
  const enhancedStockData = useMemo(() => {
    if (!stockData) return [];
    
    const consumptionMap = new Map(
      consumptionData?.map(c => [c.item_code, c.last_month_consumption]) || []
    );
    
    return stockData.map(item => {
      const lastMonthConsumption = consumptionMap.get(item.item_code) || 0;
      const daysOfStock = lastMonthConsumption > 0 
        ? Math.min(item.adjusted_quantity / (lastMonthConsumption / 30), 999) 
        : 999;
      
      let stockStatus: 'critical' | 'low' | 'normal' | 'unknown' = 'unknown';
      if (lastMonthConsumption > 0) {
        if (daysOfStock < 7) stockStatus = 'critical';
        else if (daysOfStock < 30) stockStatus = 'low';
        else stockStatus = 'normal';
      } else if (item.adjusted_quantity > 0) {
        stockStatus = 'normal';
      }
      
      return {
        ...item,
        last_month_consumption: lastMonthConsumption,
        days_of_stock: daysOfStock,
        stock_status: stockStatus
      };
    });
  }, [stockData, consumptionData]);
  
  // Apply search filter first
  const searchFilteredItems = useMemo(() => {
    if (!enhancedStockData.length) return [];
    if (!debouncedSearchTerm) return enhancedStockData;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return enhancedStockData.filter(item => {
      return item.item_code.toLowerCase().includes(searchLower) ||
             item.description?.toLowerCase().includes(searchLower) ||
             item.vendor_name?.toLowerCase().includes(searchLower);
    });
  }, [enhancedStockData, debouncedSearchTerm]);
  
  // Apply stock filters after search
  const filteredItems = useMemo(() => {
    if (!searchFilteredItems.length) return [];
    
    let filtered = searchFilteredItems;
    
    // Filter out zero stock items
    if (stockFilters.hideZeroStock) {
      filtered = filtered.filter(item => item.adjusted_quantity > 0);
    }
    
    // Show only critical and low stock items
    if (stockFilters.showOnlyCriticalAndLow) {
      filtered = filtered.filter(item => 
        item.stock_status === 'critical' || item.stock_status === 'low'
      );
    }
    
    return filtered;
  }, [searchFilteredItems, stockFilters]);
  
  // Optimized grouping with Map for better performance
  const groupedItems = useMemo(() => {
    const grouped: GroupedStockItems = {};
    
    if (filteredItems.length === 0) return grouped;
    
    const vendorGroups = new Map<string, Map<string, VendorGroup>>();
    
    filteredItems.forEach(item => {
      const groupKey = item.posting_group || 'Uncategorized';
      const vendorKey = debouncedSearchTerm 
        ? 'SEARCH_RESULTS' 
        : (item.vendor_code || 'UNKNOWN');
      
      if (!vendorGroups.has(groupKey)) {
        vendorGroups.set(groupKey, new Map());
        grouped[groupKey] = {
          category_description: item.category_description || groupKey,
          vendors: [],
          total_value: 0,
          total_items: 0,
          critical_items: 0
        };
      }
      
      const categoryVendors = vendorGroups.get(groupKey)!;
      if (!categoryVendors.has(vendorKey)) {
        const vendorGroup: VendorGroup = {
          vendor_code: debouncedSearchTerm ? 'SEARCH_RESULTS' : vendorKey,
          vendor_name: debouncedSearchTerm ? 'Search Results' : (item.vendor_name || 'Unknown Vendor'),
          items: [],
          total_value: 0,
          total_items: 0,
          critical_items: 0
        };
        categoryVendors.set(vendorKey, vendorGroup);
        grouped[groupKey].vendors.push(vendorGroup);
      }
      
      const vendorGroup = categoryVendors.get(vendorKey)!;
      vendorGroup.items.push(item);
      vendorGroup.total_value += item.stock_value;
      vendorGroup.total_items += 1;
      
      if (item.stock_status === 'critical') {
        vendorGroup.critical_items += 1;
      }
      
      grouped[groupKey].total_value += item.stock_value;
      grouped[groupKey].total_items += 1;
      
      if (item.stock_status === 'critical') {
        grouped[groupKey].critical_items += 1;
      }
    });
    
    // Sort vendors if not searching
    if (!debouncedSearchTerm) {
      Object.values(grouped).forEach(category => {
        category.vendors.sort((a, b) => {
          if (a.vendor_name === 'Unknown Vendor' && b.vendor_name !== 'Unknown Vendor') return 1;
          if (b.vendor_name === 'Unknown Vendor' && a.vendor_name !== 'Unknown Vendor') return -1;
          return (a.vendor_name || '').localeCompare(b.vendor_name || '');
        });
      });
    }
    
    return grouped;
  }, [filteredItems, debouncedSearchTerm]);
  
  return {
    items: enhancedStockData,
    filteredItems,
    groupedItems,
    isLoading: isLoading || isLoadingConsumption,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    stockFilters,
    setStockFilters
  };
};