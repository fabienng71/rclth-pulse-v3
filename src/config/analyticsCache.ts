// ANALYTICS CACHE CONFIGURATION
// Centralized cache strategy for consistent performance across all analytics

export const ANALYTICS_CACHE_CONFIG = {
  // Cache times based on data freshness requirements
  CUSTOMER_CHURN: {
    staleTime: 5 * 60 * 1000,    // 5 minutes - customer data changes frequently
    cacheTime: 15 * 60 * 1000,   // 15 minutes - keep in memory longer
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  },
  
  NEW_CUSTOMERS: {
    staleTime: 10 * 60 * 1000,   // 10 minutes - new customers don't change as often
    cacheTime: 20 * 60 * 1000,   // 20 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  },
  
  PRODUCT_PERFORMANCE: {
    staleTime: 15 * 60 * 1000,   // 15 minutes - product data is more stable
    cacheTime: 30 * 60 * 1000,   // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1500 * 2 ** attemptIndex, 30000)
  },
  
  SALESPERSON_PERFORMANCE: {
    staleTime: 10 * 60 * 1000,   // 10 minutes
    cacheTime: 25 * 60 * 1000,   // 25 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  },
  
  PREDICTIVE_CHURN: {
    staleTime: 30 * 60 * 1000,   // 30 minutes - predictive data is computationally expensive
    cacheTime: 60 * 60 * 1000,   // 1 hour
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 30000)
  },
  
  DATA_VALIDATION: {
    staleTime: 2 * 60 * 1000,    // 2 minutes - validation data should be fresh
    cacheTime: 10 * 60 * 1000,   // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  },
  
  EXECUTIVE_SUMMARY: {
    staleTime: 5 * 60 * 1000,    // 5 minutes - summary should be current
    cacheTime: 15 * 60 * 1000,   // 15 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
  }
};

// Cache invalidation patterns
export const CACHE_INVALIDATION_PATTERNS = {
  // When refreshing analytics, invalidate related caches
  REFRESH_ALL: [
    'customer-churn-analysis',
    'new-customer-analysis', 
    'product-performance-analysis',
    'salesperson-performance-analysis',
    'predictive-churn-analysis',
    'data-validation',
    'executive-summary'
  ],
  
  // When customer data changes, invalidate customer-related caches
  CUSTOMER_UPDATE: [
    'customer-churn-analysis',
    'new-customer-analysis',
    'executive-summary'
  ],
  
  // When sales data is imported, invalidate all analytics
  SALES_DATA_IMPORT: [
    'customer-churn-analysis',
    'new-customer-analysis',
    'product-performance-analysis',
    'salesperson-performance-analysis',
    'executive-summary'
  ]
};

// Query key factories for consistent cache keys
export const ANALYTICS_QUERY_KEYS = {
  customerChurn: (year: number, week: number, salesperson?: string | null, month?: number) => 
    ['customer-churn-analysis', year, week, salesperson, month, !!month],
    
  newCustomers: (year: number, week: number, salesperson?: string | null, month?: number) =>
    ['new-customer-analysis', year, week, salesperson, month, !!month],
    
  productPerformance: (year: number, week: number, salesperson?: string | null, month?: number) =>
    ['product-performance-analysis', year, week, salesperson, month, !!month],
    
  salespersonPerformance: (year: number, week: number, salesperson?: string | null, month?: number) =>
    ['salesperson-performance-analysis', year, week, salesperson, month],
    
  predictiveChurn: (year: number, week: number, salesperson?: string | null) =>
    ['predictive-churn-analysis', year, week, salesperson],
    
  dataValidation: (year: number, week: number) =>
    ['data-validation', year, week],
    
  executiveSummary: (year: number, week: number, salesperson?: string | null, month?: number) =>
    ['executive-summary', year, week, salesperson, month, !!month]
};

// Background refresh configuration
export const BACKGROUND_REFRESH_CONFIG = {
  // Enable background refetch when window regains focus
  refetchOnWindowFocus: true,
  
  // Enable background refetch when network reconnects
  refetchOnReconnect: true,
  
  // Refetch interval for real-time data (disabled by default to save resources)
  refetchInterval: false,
  
  // Refetch when component mounts if data is stale
  refetchOnMount: true
};

// Cache warming strategy - preload commonly accessed data
export const CACHE_WARMING_STRATEGY = {
  // Preload current month data when loading weekly data
  PRELOAD_MONTHLY_WHEN_WEEKLY: true,
  
  // Preload previous period data for comparison
  PRELOAD_COMPARISON_PERIODS: true,
  
  // Preload all salesperson data when loading specific salesperson
  PRELOAD_ALL_WHEN_SPECIFIC: false, // Disabled to avoid excessive API calls
};

// Memory management
export const MEMORY_MANAGEMENT = {
  // Maximum number of query results to keep in memory
  maxQueries: 50,
  
  // Default cache time if not specified
  defaultCacheTime: 15 * 60 * 1000, // 15 minutes
  
  // Garbage collection interval
  gcTime: 5 * 60 * 1000, // 5 minutes
};

// Analytics-specific error retry logic
export const getRetryConfig = (queryType: keyof typeof ANALYTICS_CACHE_CONFIG) => {
  const config = ANALYTICS_CACHE_CONFIG[queryType];
  return {
    retry: config.retry,
    retryDelay: config.retryDelay,
    // Don't retry on specific errors
    retryCondition: (error: any) => {
      // Don't retry on authentication errors
      if (error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
        return false;
      }
      // Don't retry on permission errors
      if (error?.code === 'PGRST103') {
        return false;
      }
      // Don't retry on function not found errors
      if (error?.code === 'PGRST202') {
        return false;
      }
      // Retry on network errors, timeouts, and temporary database issues
      return true;
    }
  };
};