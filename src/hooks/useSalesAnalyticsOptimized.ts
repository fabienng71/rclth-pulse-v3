// OPTIMIZED SALES ANALYTICS HOOK WITH PARALLEL API CALLS
// This replaces the sequential calls with parallel execution for better performance

import { useQueries, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { 
  CustomerChurnAnalysis, 
  NewCustomerAnalysis, 
  ProductPerformanceAnalysis,
  SalespersonPerformanceAnalysis,
  PredictiveChurnAnalysis,
  ExecutiveSummary,
  DataValidation 
} from './useSalesAnalytics';
import { 
  ANALYTICS_CACHE_CONFIG,
  ANALYTICS_QUERY_KEYS,
  BACKGROUND_REFRESH_CONFIG,
  getRetryConfig
} from '@/config/analyticsCache';

// Batch API call configuration
interface BatchAnalyticsConfig {
  year: number;
  week: number;
  salespersonCode?: string;
  month?: number;
}

// Single API call for all analytics data
export const useBatchedSalesAnalytics = (config: BatchAnalyticsConfig) => {
  const { isAdmin, profile } = useAuthStore();
  const effectiveSalesperson = config.salespersonCode || (isAdmin ? null : profile?.spp_code);
  const isMonthlyAnalysis = config.month && config.week !== 0 && config.year && config.month >= 1 && config.month <= 12;

  // Define all queries to run in parallel
  const queries = useQueries({
    queries: [
      // Customer Churn Analysis
      {
        queryKey: ANALYTICS_QUERY_KEYS.customerChurn(config.year, config.week, effectiveSalesperson, config.month),
        queryFn: async (): Promise<CustomerChurnAnalysis[]> => {
          const functionName = isMonthlyAnalysis ? 'get_monthly_customer_churn_analysis' : 'get_customer_churn_analysis';
          const params = isMonthlyAnalysis 
            ? { p_year: config.year, p_month: config.month, p_salesperson_code: effectiveSalesperson || null }
            : { p_year: config.year, p_week: config.week, p_salesperson_code: effectiveSalesperson || null };

          const { data, error } = await supabase.rpc(functionName, params);
          if (error) throw error;
          return data || [];
        },
        ...ANALYTICS_CACHE_CONFIG.CUSTOMER_CHURN,
        ...BACKGROUND_REFRESH_CONFIG,
      },
      
      // New Customer Analysis
      {
        queryKey: ANALYTICS_QUERY_KEYS.newCustomers(config.year, config.week, effectiveSalesperson, config.month),
        queryFn: async (): Promise<NewCustomerAnalysis[]> => {
          const functionName = isMonthlyAnalysis ? 'get_monthly_new_customer_analysis' : 'get_new_customer_analysis';
          const params = isMonthlyAnalysis 
            ? { p_year: config.year, p_month: config.month, p_salesperson_code: effectiveSalesperson || null }
            : { p_year: config.year, p_week: config.week, p_salesperson_code: effectiveSalesperson || null };

          const { data, error } = await supabase.rpc(functionName, params);
          if (error) throw error;
          return data || [];
        },
        ...ANALYTICS_CACHE_CONFIG.NEW_CUSTOMERS,
        ...BACKGROUND_REFRESH_CONFIG,
      },

      // Product Performance Analysis
      {
        queryKey: ANALYTICS_QUERY_KEYS.productPerformance(config.year, config.week, effectiveSalesperson, config.month),
        queryFn: async (): Promise<ProductPerformanceAnalysis[]> => {
          const functionName = isMonthlyAnalysis ? 'get_monthly_product_performance_analysis' : 'get_product_performance_analysis';
          const params = isMonthlyAnalysis 
            ? { p_year: config.year, p_month: config.month, p_salesperson_code: effectiveSalesperson || null }
            : { p_year: config.year, p_week: config.week, p_salesperson_code: effectiveSalesperson || null };

          const { data, error } = await supabase.rpc(functionName, params);
          if (error) throw error;
          return data || [];
        },
        ...ANALYTICS_CACHE_CONFIG.PRODUCT_PERFORMANCE,
        ...BACKGROUND_REFRESH_CONFIG,
      },

      // Salesperson Performance Analysis
      {
        queryKey: ANALYTICS_QUERY_KEYS.salespersonPerformance(config.year, config.week, effectiveSalesperson, config.month),
        queryFn: async (): Promise<SalespersonPerformanceAnalysis[]> => {
          if (config.month) {
            const { data, error } = await supabase.rpc('get_monthly_salesperson_performance_analysis_fixed', {
              p_year: config.year,
              p_month: config.month,
              p_salesperson_code: effectiveSalesperson || null
            });
            if (error) throw error;
            return data || [];
          } else {
            const { data, error } = await supabase.rpc('get_salesperson_performance_analysis', {
              p_year: config.year,
              p_week: config.week,
              p_salesperson_code: effectiveSalesperson || null
            });
            if (error) throw error;
            return data || [];
          }
        },
        ...ANALYTICS_CACHE_CONFIG.SALESPERSON_PERFORMANCE,
        ...BACKGROUND_REFRESH_CONFIG,
      },

      // Predictive Churn Analysis (weekly only for now)
      {
        queryKey: ANALYTICS_QUERY_KEYS.predictiveChurn(config.year, config.week, effectiveSalesperson),
        queryFn: async (): Promise<PredictiveChurnAnalysis[]> => {
          const { data, error } = await supabase.rpc('get_predictive_churn_analysis', {
            p_year: config.year,
            p_week: config.week,
            p_salesperson_code: effectiveSalesperson || null
          });
          if (error) throw error;
          return data || [];
        },
        ...ANALYTICS_CACHE_CONFIG.PREDICTIVE_CHURN,
        ...BACKGROUND_REFRESH_CONFIG,
        enabled: !isMonthlyAnalysis, // Only run for weekly analysis
      },

      // Data Validation
      {
        queryKey: ANALYTICS_QUERY_KEYS.dataValidation(config.year, config.week),
        queryFn: async (): Promise<DataValidation[]> => {
          try {
            const { data, error } = await supabase.rpc('validate_sales_analytics_data', {
              p_year: config.year,
              p_week: config.week
            });
            if (error) {
              // Try fallback function
              const fallbackResult = await supabase.rpc('validate_sales_analytics_data_fallback', {
                p_year: config.year,
                p_week: config.week
              });
              if (fallbackResult.error) throw fallbackResult.error;
              return fallbackResult.data || [];
            }
            return data || [];
          } catch (err) {
            console.error('Data validation error:', err);
            return [];
          }
        },
        ...ANALYTICS_CACHE_CONFIG.DATA_VALIDATION,
        ...BACKGROUND_REFRESH_CONFIG,
      }
    ]
  });

  // Extract results from parallel queries
  const [
    customerChurnQuery,
    newCustomersQuery,
    productPerformanceQuery,
    salespersonPerformanceQuery,
    predictiveChurnQuery,
    dataValidationQuery
  ] = queries;

  // Calculate aggregate loading state
  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const errors = queries.filter(query => query.error).map(query => query.error);

  // Executive summary - calculated from other data when available
  const executiveSummary: ExecutiveSummary[] = [];
  
  if (customerChurnQuery.data && newCustomersQuery.data && productPerformanceQuery.data) {
    const churnData = customerChurnQuery.data;
    const newCustomerData = newCustomersQuery.data;
    const productData = productPerformanceQuery.data;

    // Calculate summary metrics
    const atRiskCustomers = churnData.filter(c => c.churn_status === 'AT_RISK').length;
    const churnedCustomers = churnData.filter(c => c.churn_status === 'CHURNED').length;
    const totalNewCustomers = newCustomerData.length;
    const highValueNewCustomers = newCustomerData.filter(c => c.customer_potential === 'HIGH_POTENTIAL').length;
    const surgingProducts = productData.filter(p => p.product_status === 'SURGING').length;
    const decliningProducts = productData.filter(p => p.product_status === 'DECLINING' || p.product_status === 'DROPPING').length;

    const period = isMonthlyAnalysis ? `${getMonthName(config.month!)} ${config.year}` : `Week ${config.week} ${config.year}`;
    const comparisonPeriod = isMonthlyAnalysis ? 'Previous Month' : 'Previous Week';

    executiveSummary.push(
      {
        metric_category: 'Customer Health',
        metric_name: `${period} At-Risk Customers`,
        metric_value: atRiskCustomers,
        metric_unit: 'count',
        comparison_value: 0, // TODO: Get from previous period
        comparison_period: comparisonPeriod,
        trend_direction: atRiskCustomers > 10 ? 'UP' : atRiskCustomers < 5 ? 'DOWN' : 'STABLE',
        alert_level: atRiskCustomers > 20 ? 'HIGH' : atRiskCustomers > 10 ? 'MEDIUM' : 'LOW',
        insight_summary: atRiskCustomers > 20 ? 'High customer churn risk - immediate action needed' : 
                        atRiskCustomers > 10 ? 'Moderate churn risk - proactive outreach recommended' : 
                        'Customer retention is healthy'
      },
      {
        metric_category: 'Growth Metrics',
        metric_name: `${period} New Customers`,
        metric_value: totalNewCustomers,
        metric_unit: 'count',
        comparison_value: 0, // TODO: Get from previous period
        comparison_period: comparisonPeriod,
        trend_direction: totalNewCustomers > 10 ? 'UP' : totalNewCustomers < 3 ? 'DOWN' : 'STABLE',
        alert_level: totalNewCustomers < 3 ? 'HIGH' : totalNewCustomers < 7 ? 'MEDIUM' : 'LOW',
        insight_summary: totalNewCustomers > 15 ? 'Strong customer acquisition' : 
                        totalNewCustomers < 5 ? 'Customer acquisition needs attention' : 
                        'Customer acquisition on track'
      },
      {
        metric_category: 'Product Performance',
        metric_name: `${period} Product Health`,
        metric_value: surgingProducts - decliningProducts,
        metric_unit: 'net_score',
        comparison_value: 0, // TODO: Get from previous period
        comparison_period: comparisonPeriod,
        trend_direction: surgingProducts > decliningProducts ? 'UP' : surgingProducts < decliningProducts ? 'DOWN' : 'STABLE',
        alert_level: decliningProducts > surgingProducts * 2 ? 'HIGH' : decliningProducts > surgingProducts ? 'MEDIUM' : 'LOW',
        insight_summary: surgingProducts > decliningProducts * 2 ? 'Strong product portfolio growth' :
                        decliningProducts > surgingProducts ? 'Product portfolio needs attention' :
                        'Product performance balanced'
      }
    );
  }

  // Refresh function for all analytics
  const queryClient = useQueryClient();
  const refreshAnalytics = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['customer-churn-analysis-batch'] }),
      queryClient.invalidateQueries({ queryKey: ['new-customer-analysis-batch'] }),
      queryClient.invalidateQueries({ queryKey: ['product-performance-analysis-batch'] }),
      queryClient.invalidateQueries({ queryKey: ['salesperson-performance-analysis-batch'] }),
      queryClient.invalidateQueries({ queryKey: ['predictive-churn-analysis-batch'] }),
      queryClient.invalidateQueries({ queryKey: ['data-validation-batch'] })
    ]);
  };

  return {
    // Data - safely handle undefined with fallbacks
    customerChurn: customerChurnQuery.data || [],
    newCustomers: newCustomersQuery.data || [],
    productPerformance: productPerformanceQuery.data || [],
    salespersonPerformance: salespersonPerformanceQuery.data || [],
    predictiveChurn: predictiveChurnQuery?.data || [],
    executiveSummary,
    dataValidation: dataValidationQuery.data || [],
    
    // State
    isLoading,
    isError,
    error: errors[0] || null,
    
    // Actions
    refreshAnalytics,
    
    // Individual query states for granular loading
    individualStates: {
      customerChurn: { 
        isLoading: customerChurnQuery.isLoading, 
        isError: customerChurnQuery.isError, 
        error: customerChurnQuery.error 
      },
      newCustomers: { 
        isLoading: newCustomersQuery.isLoading, 
        isError: newCustomersQuery.isError, 
        error: newCustomersQuery.error 
      },
      productPerformance: { 
        isLoading: productPerformanceQuery.isLoading, 
        isError: productPerformanceQuery.isError, 
        error: productPerformanceQuery.error 
      },
      salespersonPerformance: { 
        isLoading: salespersonPerformanceQuery.isLoading, 
        isError: salespersonPerformanceQuery.isError, 
        error: salespersonPerformanceQuery.error 
      },
      predictiveChurn: { 
        isLoading: predictiveChurnQuery?.isLoading || false, 
        isError: predictiveChurnQuery?.isError || false, 
        error: predictiveChurnQuery?.error || null 
      },
      executiveSummary: { 
        isLoading: isLoading, 
        isError: false, 
        error: null 
      },
      dataValidation: { 
        isLoading: dataValidationQuery.isLoading, 
        isError: dataValidationQuery.isError, 
        error: dataValidationQuery.error 
      },
    }
  };
};

// Helper function for month names
function getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1] || 'Unknown';
}

// Backwards compatible wrapper
export const useSalesAnalyticsOptimized = (year: number, week: number, salespersonCode?: string, month?: number) => {
  return useBatchedSalesAnalytics({ year, week, salespersonCode, month });
};