import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types for channel intelligence data
export interface CustomerChannelBasket {
  customer_code: string;
  channel_code: string;
  avg_basket_size_amount: number;
  avg_basket_size_items: number;
  avg_basket_margin_amount: number;
  avg_basket_margin_percent: number;
  total_transactions: number;
  total_spend: number;
  total_margin_dollars: number;
  purchase_frequency: number;
}

export interface ChannelBasketOverview {
  channel_code: string;
  channel_name: string;
  avg_basket_size_amount: number;
  avg_basket_margin_percent: number;
  total_customers: number;
  total_transactions: number;
  total_revenue: number;
  avg_items_per_basket: number;
}

export interface CustomerChannelPerformance {
  customer_code: string;
  customer_name: string;
  channel_code: string;
  avg_basket_size_amount: number;
  basket_size_vs_channel_avg: number;
  avg_margin_percent: number;
  margin_vs_channel_avg: number;
  total_transactions: number;
  total_spend: number;
  purchase_frequency: number;
}

export interface CrossSellOpportunity {
  channel_code: string;
  product_a_code: string;
  product_a_description: string;
  product_b_code: string;
  product_b_description: string;
  confidence_score: number;
  co_occurrence_count: number;
  avg_combined_revenue: number;
  margin_improvement_potential: number;
}

export interface ChannelProductAnalysis {
  item_code: string;
  item_description: string;
  total_quantity: number;
  total_revenue: number;
  total_transactions: number;
  lowest_price: number;
  highest_price: number;
  average_price: number;
  average_margin_percent: number;
  total_margin_dollars: number;
  frequency_score: number;
}

export interface ChannelMarginAnalysis {
  channel_code: string;
  channel_name: string;
  avg_margin_percent: number;
  total_margin_dollars: number;
  total_revenue: number;
  margin_per_transaction: number;
  total_transactions: number;
  prev_avg_margin_percent: number;
  margin_trend: string;
  margin_efficiency_score: number;
  volume_category: string;
  margin_category: string;
}

export interface ProductMarginPerformance {
  item_code: string;
  item_description: string;
  avg_margin_percent: number;
  total_margin_dollars: number;
  total_revenue: number;
  total_quantity: number;
  channel_count: number;
  avg_price: number;
  margin_consistency_score: number;
  performance_category: string;
  revenue_impact_score: number;
}

export interface MarginOptimizationOpportunity {
  opportunity_type: string;
  item_code: string;
  item_description: string;
  posting_group: string;
  high_margin_channel: string;
  low_margin_channel: string;
  high_margin_percent: number;
  low_margin_percent: number;
  margin_gap: number;
  potential_revenue_impact: number;
  recommendation: string;
  priority_score: number;
}

export interface PostingGroup {
  posting_group: string;
  category_name: string;
  total_revenue: number;
  product_count: number;
}

export interface MarginTrend {
  period_month: string;
  period_year: number;
  channel_code: string;
  channel_name: string;
  avg_margin_percent: number;
  total_revenue: number;
  total_margin_dollars: number;
  month_over_month_change: number;
}

export interface ChannelIntelligenceKPIs {
  total_channels: number;
  active_channels: number;
  avg_basket_size_overall: number;
  avg_margin_percent_overall: number;
  total_customers: number;
  total_revenue: number;
  cross_sell_rate: number;
}

// Date range options
export interface DateRange {
  start_date: string;
  end_date: string;
}

// Filter options
export interface ChannelIntelligenceFilters {
  dateRange: DateRange;
  selectedChannels: string[];
  selectedCustomer?: string;
  metricFocus: 'basket_analysis' | 'margin_intelligence' | 'cross_sell' | 'customer_behavior';
}

/**
 * Hook to get customer-channel basket metrics
 */
export const useCustomerChannelBaskets = (
  startDate?: string,
  endDate?: string,
  customerCode?: string,
  channelCode?: string
) => {
  return useQuery({
    queryKey: ['customer-channel-baskets', startDate, endDate, customerCode, channelCode],
    queryFn: async (): Promise<CustomerChannelBasket[]> => {
      const { data, error } = await supabase.rpc('calculate_customer_channel_baskets', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_customer_code: customerCode || null,
        p_channel_code: channelCode || null
      });

      if (error) {
        console.error('Error fetching customer channel baskets:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
};

/**
 * Hook to get channel basket overview
 */
export const useChannelBasketOverview = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['channel-basket-overview', startDate, endDate],
    queryFn: async (): Promise<ChannelBasketOverview[]> => {
      const { data, error } = await supabase.rpc('get_channel_basket_overview', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error fetching channel basket overview:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to get customer channel performance vs averages
 */
export const useCustomerChannelPerformance = (
  startDate?: string,
  endDate?: string,
  channelCode?: string
) => {
  return useQuery({
    queryKey: ['customer-channel-performance', startDate, endDate, channelCode],
    queryFn: async (): Promise<CustomerChannelPerformance[]> => {
      const { data, error } = await supabase.rpc('get_customer_channel_performance', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_channel_code: channelCode || null
      });

      if (error) {
        console.error('Error fetching customer channel performance:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook to get cross-sell opportunities
 */
export const useCrossSellOpportunities = (
  channelCode?: string,
  minConfidence: number = 0.3,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ['cross-sell-opportunities', channelCode, minConfidence, limit],
    queryFn: async (): Promise<CrossSellOpportunity[]> => {
      const { data, error } = await supabase.rpc('get_cross_sell_opportunities', {
        p_channel_code: channelCode || null,
        p_min_confidence: minConfidence,
        p_limit: limit
      });

      if (error) {
        console.error('Error fetching cross-sell opportunities:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (less frequent updates)
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
};

/**
 * Hook to get channel intelligence KPIs
 */
export const useChannelIntelligenceKPIs = (
  startDate?: string, 
  endDate?: string,
  channelCode?: string
) => {
  return useQuery({
    queryKey: ['channel-intelligence-kpis', startDate, endDate, channelCode],
    queryFn: async (): Promise<ChannelIntelligenceKPIs> => {
      const { data, error } = await supabase.rpc('get_channel_intelligence_kpis', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_channel_code: channelCode || null
      });

      if (error) {
        console.error('Error fetching channel intelligence KPIs:', error);
        throw error;
      }

      return data?.[0] || {
        total_channels: 0,
        active_channels: 0,
        avg_basket_size_overall: 0,
        avg_margin_percent_overall: 0,
        total_customers: 0,
        total_revenue: 0,
        cross_sell_rate: 0
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });
};

/**
 * Hook to get available channels for filtering
 */
export const useChannelsList = () => {
  return useQuery({
    queryKey: ['channels-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('customer_type_code, channel_name')
        .order('channel_name');

      if (error) {
        console.error('Error fetching channels list:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
};

/**
 * Hook to get customers for filtering (admin only)
 */
export const useCustomersForChannelIntelligence = (channelCode?: string) => {
  return useQuery({
    queryKey: ['customers-channel-intelligence', channelCode],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select('customer_code, customer_name, customer_type_code')
        .order('customer_name');

      if (channelCode) {
        query = query.eq('customer_type_code', channelCode);
      }

      const { data, error } = await query.limit(1000); // Limit for performance

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    enabled: true, // Always enabled, but filtered by RLS
  });
};

/**
 * Utility hook for date range presets
 */
export const useDateRangePresets = () => {
  const getDateRange = (preset: string): DateRange => {
    const endDate = new Date();
    const startDate = new Date();

    switch (preset) {
      case 'last_30_days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last_90_days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'last_6_months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'last_12_months':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 90); // Default to 90 days
    }

    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  };

  return { getDateRange };
};

/**
 * Hook to get channel product analysis
 */
export const useChannelProductAnalysis = (
  channelCode: string,
  startDate?: string,
  endDate?: string,
  limit: number = 5
) => {
  return useQuery({
    queryKey: ['channel-product-analysis', channelCode, startDate, endDate, limit],
    queryFn: async (): Promise<ChannelProductAnalysis[]> => {
      const { data, error } = await supabase.rpc('get_channel_product_analysis', {
        p_channel_code: channelCode,
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_limit: limit
      });

      if (error) {
        console.error('Error fetching channel product analysis:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    enabled: !!channelCode, // Only run if channelCode is provided
  });
};

/**
 * Hook to get channel margin analysis
 */
export const useChannelMarginAnalysis = (
  startDate?: string,
  endDate?: string,
  compareStartDate?: string,
  compareEndDate?: string
) => {
  return useQuery({
    queryKey: ['channel-margin-analysis', startDate, endDate, compareStartDate, compareEndDate],
    queryFn: async (): Promise<ChannelMarginAnalysis[]> => {
      const { data, error } = await supabase.rpc('get_channel_margin_analysis', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_compare_start_date: compareStartDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_compare_end_date: compareEndDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error fetching channel margin analysis:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
};

/**
 * Hook to get product margin performance
 */
export const useProductMarginPerformance = (
  analysisType: 'champions' | 'underperformers' | 'opportunities' | 'all' = 'champions',
  startDate?: string,
  endDate?: string,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['product-margin-performance', analysisType, startDate, endDate, limit],
    queryFn: async (): Promise<ProductMarginPerformance[]> => {
      const { data, error } = await supabase.rpc('get_product_margin_performance', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_analysis_type: analysisType,
        p_limit: limit
      });

      if (error) {
        console.error('Error fetching product margin performance:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
};

/**
 * Hook to get margin optimization opportunities
 */
export const useMarginOptimizationOpportunities = (
  startDate?: string,
  endDate?: string,
  limit: number = 15,
  postingGroup?: string
) => {
  return useQuery({
    queryKey: ['margin-optimization-opportunities', startDate, endDate, limit, postingGroup],
    queryFn: async (): Promise<MarginOptimizationOpportunity[]> => {
      const { data, error } = await supabase.rpc('get_margin_optimization_opportunities', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0],
        p_limit: limit,
        p_posting_group: postingGroup || null
      });

      if (error) {
        console.error('Error fetching margin optimization opportunities:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
};

/**
 * Hook to get margin trends
 */
export const useMarginTrends = (
  channelCode?: string,
  monthsBack: number = 6
) => {
  return useQuery({
    queryKey: ['margin-trends', channelCode, monthsBack],
    queryFn: async (): Promise<MarginTrend[]> => {
      const { data, error } = await supabase.rpc('get_margin_trends', {
        p_channel_code: channelCode || null,
        p_months_back: monthsBack
      });

      if (error) {
        console.error('Error fetching margin trends:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
};

/**
 * Combined hook for channel intelligence dashboard
 */
export const useChannelIntelligenceDashboard = (filters: ChannelIntelligenceFilters) => {
  const { dateRange, selectedChannels, selectedCustomer } = filters;
  
  const kpis = useChannelIntelligenceKPIs(
    dateRange.start_date, 
    dateRange.end_date,
    selectedChannels.length === 1 ? selectedChannels[0] : undefined
  );
  const channelOverview = useChannelBasketOverview(dateRange.start_date, dateRange.end_date);
  const customerBaskets = useCustomerChannelBaskets(
    dateRange.start_date, 
    dateRange.end_date, 
    selectedCustomer,
    selectedChannels.length === 1 ? selectedChannels[0] : undefined
  );
  const customerPerformance = useCustomerChannelPerformance(
    dateRange.start_date,
    dateRange.end_date,
    selectedChannels.length === 1 ? selectedChannels[0] : undefined
  );
  const crossSellOpportunities = useCrossSellOpportunities(
    selectedChannels.length === 1 ? selectedChannels[0] : undefined
  );

  return {
    kpis,
    channelOverview,
    customerBaskets,
    customerPerformance,
    crossSellOpportunities,
    isLoading: kpis.isLoading || channelOverview.isLoading || customerBaskets.isLoading,
    error: kpis.error || channelOverview.error || customerBaskets.error,
  };
};

/**
 * Hook to get available posting groups for margin analysis filtering
 */
export const usePostingGroupsForMarginAnalysis = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['posting-groups-margin-analysis', startDate, endDate],
    queryFn: async (): Promise<PostingGroup[]> => {
      const { data, error } = await supabase.rpc('get_posting_groups_for_margin_analysis', {
        p_start_date: startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        p_end_date: endDate || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error fetching posting groups for margin analysis:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - posting groups don't change frequently
    gcTime: 60 * 60 * 1000,    // 1 hour
  });
};