import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export interface CustomerWithAnalytics {
  customer_code: string;
  customer_name: string;
  search_name: string | null;
  salesperson_code: string | null;
  customer_type_code: string | null;
  total_turnover: number; // Last 12 months turnover (primary metric for UI display)
  lifetime_turnover: number; // Historical total turnover (all-time)
  last_12_months_turnover: number; // Explicitly labeled 12-month turnover
  total_transactions: number;
  active_days: number;
  first_transaction_date: string | null;
  last_transaction_date: string | null;
  recent_90d_turnover: number;
  recent_90d_transactions: number;
  previous_90d_turnover: number;
  ytd_turnover: number; // Year-to-date turnover
  previous_year_turnover: number;
  recency_days: number;
  frequency_per_month: number;
  monetary_value: number;
  growth_trend: 'growing' | 'stable' | 'declining';
  health_score: number;
  rfm_segment: 'champions' | 'loyal_customers' | 'potential_loyalists' | 'at_risk' | 'hibernating';
  is_at_risk: boolean;
  is_new_customer: boolean;
  activity_count: number;
  last_activity_date: string | null;
  sample_request_count: number;
  last_sample_request_date: string | null;
  average_order_value: number;
  days_since_last_activity: number;
  computed_at: string;
}

export interface CustomerReportFilters {
  salespersonCode?: string;
  channelCode?: string | null;
  healthScoreMin?: number;
  healthScoreMax?: number;
  rfmSegment?: string;
  isAtRisk?: boolean;
  isNewCustomer?: boolean;
  growthTrend?: string;
  minTurnover?: number;
  maxTurnover?: number;
  recencyDaysMax?: number;
}

// Enhanced data fetching function with fallback to regular tables
const fetchCustomersWithAnalytics = async (
  filters: CustomerReportFilters,
  profile: any,
  isAdmin: boolean
): Promise<CustomerWithAnalytics[]> => {
  console.log('Fetching customers with analytics:', {
    filters,
    profile,
    isAdmin
  });
  
  // Try materialized view first, fallback to regular tables
  try {
    // Build query from materialized view
    let query = supabase
      .from('customer_analytics_mv')
      .select('*');
    
    // Apply salesperson filter
    if (!isAdmin && profile?.spp_code) {
      query = query.eq('salesperson_code', profile.spp_code);
    } else if (isAdmin && filters.salespersonCode && filters.salespersonCode !== 'all') {
      query = query.eq('salesperson_code', filters.salespersonCode);
    }
    
    // Apply channel filter
    if (filters.channelCode) {
      query = query.eq('customer_type_code', filters.channelCode);
    }
    
    // Apply additional filters
    if (filters.healthScoreMin !== undefined) {
      query = query.gte('health_score', filters.healthScoreMin);
    }
    if (filters.healthScoreMax !== undefined) {
      query = query.lte('health_score', filters.healthScoreMax);
    }
    if (filters.rfmSegment) {
      query = query.eq('rfm_segment', filters.rfmSegment);
    }
    if (filters.isAtRisk !== undefined) {
      query = query.eq('is_at_risk', filters.isAtRisk);
    }
    if (filters.isNewCustomer !== undefined) {
      query = query.eq('is_new_customer', filters.isNewCustomer);
    }
    if (filters.growthTrend) {
      query = query.eq('growth_trend', filters.growthTrend);
    }
    if (filters.minTurnover !== undefined) {
      query = query.gte('last_12_months_turnover', filters.minTurnover);
    }
    if (filters.maxTurnover !== undefined) {
      query = query.lte('last_12_months_turnover', filters.maxTurnover);
    }
    if (filters.recencyDaysMax !== undefined) {
      query = query.lte('recency_days', filters.recencyDaysMax);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.log('Materialized view not available, using fallback approach');
      return await fetchCustomersWithAnalyticsFallback(filters, profile, isAdmin);
    }
    
    // Transform materialized view data to match interface
    const transformedData = (data || []).map(row => ({
      ...row,
      total_turnover: row.last_12_months_turnover, // Use 12-month field for UI display
      // Include both fields for transparency
      lifetime_turnover: row.lifetime_turnover,
      last_12_months_turnover: row.last_12_months_turnover
    }));
    
    console.log('Using materialized view for customer analytics:', { count: transformedData.length });
    
    return transformedData;
  } catch (error) {
    console.log('Error with materialized view, using fallback approach:', error);
    return await fetchCustomersWithAnalyticsFallback(filters, profile, isAdmin);
  }
};

// Fallback function using regular tables
const fetchCustomersWithAnalyticsFallback = async (
  filters: CustomerReportFilters,
  profile: any,
  isAdmin: boolean
): Promise<CustomerWithAnalytics[]> => {
  console.log('Using fallback approach for customer analytics');
  
  // First get basic customer data
  let customerQuery = supabase
    .from('customers')
    .select('customer_code, customer_name, search_name, salesperson_code, customer_type_code');
  
  // Apply salesperson filter
  if (!isAdmin && profile?.spp_code) {
    customerQuery = customerQuery.eq('salesperson_code', profile.spp_code);
  } else if (isAdmin && filters.salespersonCode && filters.salespersonCode !== 'all') {
    customerQuery = customerQuery.eq('salesperson_code', filters.salespersonCode);
  }
  
  // Apply channel filter
  if (filters.channelCode) {
    customerQuery = customerQuery.eq('customer_type_code', filters.channelCode);
  }
  
  const { data: customers, error: customerError } = await customerQuery;
  
  if (customerError) {
    console.error('Error fetching customers:', customerError);
    throw customerError;
  }
  
  if (!customers || customers.length === 0) {
    return [];
  }
  
  // Get customer codes for batch queries
  const customerCodes = customers.map(c => c.customer_code);
  
  // Use salesdata as primary source to match dashboard calculations
  let salesData: any[] = [];
  
  // Use salesdata directly (same as dashboard)
  const { data: salesDataPrimary, error: salesError } = await supabase
    .from('salesdata')
    .select('customer_code, amount, posting_date, document_no')
    .in('customer_code', customerCodes)
    .order('posting_date', { ascending: false });
  
  if (salesError) {
    console.error('Error fetching sales data from salesdata:', salesError);
    throw salesError;
  } else {
    salesData = salesDataPrimary || [];
    console.log('Using salesdata (same as dashboard), found records:', salesData.length);
  }
  
  // Log data info for debugging
  if (salesData.length > 0) {
    const mostRecentDate = salesData[0]?.posting_date;
    const daysSinceLastData = mostRecentDate ? 
      Math.floor((new Date().getTime() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24)) : 
      null;
    
    console.log('Most recent transaction date:', mostRecentDate, 'Days ago:', daysSinceLastData);
    console.log('Using salesdata directly to match dashboard calculations');
  }
  
  // Process sales data to calculate analytics
  const customerAnalytics = customers.map(customer => {
    const customerSales = salesData?.filter(s => s.customer_code === customer.customer_code) || [];
    
    console.log(`Processing customer ${customer.customer_code}:`, {
      salesCount: customerSales.length,
      sampleSales: customerSales.slice(0, 3).map(s => ({
        date: s.posting_date,
        amount: s.amount
      }))
    });
    
    // Calculate basic metrics with time period awareness
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const ytdStart = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    
    // Parse dates more carefully, handling different date formats
    const parseDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      
      // Handle different date formats
      let date: Date;
      if (dateStr.includes('T')) {
        // ISO format with time
        date = new Date(dateStr);
      } else if (dateStr.includes('-')) {
        // Date-only format (YYYY-MM-DD)
        date = new Date(dateStr + 'T00:00:00');
      } else {
        // Fallback
        date = new Date(dateStr);
      }
      
      // Validate date
      return isNaN(date.getTime()) ? null : date;
    };
    
    // Calculate dates with proper parsing
    const validSalesWithDates = customerSales
      .map(s => ({ ...s, parsedDate: parseDate(s.posting_date) }))
      .filter(s => s.parsedDate !== null)
      .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());
    
    // Calculate different turnover periods
    const totalTurnover = customerSales.reduce((sum, sale) => sum + (sale.amount || 0), 0); // Historical total
    
    // Last 12 months turnover (most relevant for business)
    const last12MonthsTurnover = validSalesWithDates && validSalesWithDates.length > 0
      ? validSalesWithDates
          .filter(s => s.parsedDate! >= oneYearAgo)
          .reduce((sum, sale) => sum + (sale.amount || 0), 0)
      : 0;
    
    // YTD turnover (current year)
    const ytdTurnover = validSalesWithDates && validSalesWithDates.length > 0
      ? validSalesWithDates
          .filter(s => s.parsedDate! >= ytdStart)
          .reduce((sum, sale) => sum + (sale.amount || 0), 0)
      : 0;
    
    // Use last 12 months as the primary turnover metric for business relevance
    const primaryTurnover = last12MonthsTurnover;
    
    // Get unique documents for accurate transaction count
    const uniqueDocuments = new Set(customerSales.map(s => s.document_no || `${s.posting_date}_${s.amount}`));
    const totalTransactions = uniqueDocuments.size;
    
    const firstTransactionDate = validSalesWithDates && validSalesWithDates.length > 0 
      ? validSalesWithDates[0]?.parsedDate || null
      : null;
    const lastTransactionDate = validSalesWithDates && validSalesWithDates.length > 0
      ? validSalesWithDates[validSalesWithDates.length - 1]?.parsedDate || null
      : null;
    
    // Calculate recency with proper date handling (now already declared above)
    const recencyDays = lastTransactionDate 
      ? Math.floor((now.getTime() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24))
      : 9999;
    
    // Calculate frequency (transactions per month) - more accurate
    const frequencyPerMonth = firstTransactionDate && lastTransactionDate && totalTransactions > 0
      ? totalTransactions / Math.max(1, (lastTransactionDate.getTime() - firstTransactionDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      : 0;
    
    // Calculate recent vs previous periods with proper date filtering
    const recent90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const previous90Days = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    
    const recent90dSales = validSalesWithDates && validSalesWithDates.length > 0
      ? validSalesWithDates.filter(s => s.parsedDate! >= recent90Days)
      : [];
    const previous90dSales = validSalesWithDates && validSalesWithDates.length > 0
      ? validSalesWithDates.filter(s => 
          s.parsedDate! >= previous90Days && s.parsedDate! < recent90Days
        )
      : [];
    
    const recent90dTurnover = recent90dSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const previous90dTurnover = previous90dSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const recent90dTransactions = new Set(recent90dSales.map(s => s.document_no || `${s.posting_date}_${s.amount}`)).size;
    
    // Calculate growth trend with better logic
    let growthTrend: 'growing' | 'stable' | 'declining' = 'stable';
    if (previous90dTurnover > 0) {
      const changePercent = ((recent90dTurnover - previous90dTurnover) / previous90dTurnover) * 100;
      if (changePercent > 15) growthTrend = 'growing';
      else if (changePercent < -15) growthTrend = 'declining';
    } else if (recent90dTurnover > 0) {
      growthTrend = 'growing';
    }
    
    // Improved health score calculation (using last 12 months for monetary score)
    const recencyScore = recencyDays <= 7 ? 40 : 
                        recencyDays <= 14 ? 35 : 
                        recencyDays <= 30 ? 30 : 
                        recencyDays <= 60 ? 20 : 
                        recencyDays <= 90 ? 10 : 0;
    
    const frequencyScore = totalTransactions >= 50 ? 30 : 
                          totalTransactions >= 20 ? 25 : 
                          totalTransactions >= 10 ? 20 : 
                          totalTransactions >= 5 ? 15 : 
                          totalTransactions >= 2 ? 10 : 
                          totalTransactions >= 1 ? 5 : 0;
    
    // Use last 12 months turnover for more relevant monetary scoring
    const monetaryScore = primaryTurnover >= 100000 ? 30 : 
                         primaryTurnover >= 50000 ? 25 : 
                         primaryTurnover >= 20000 ? 20 : 
                         primaryTurnover >= 10000 ? 15 : 
                         primaryTurnover >= 5000 ? 10 : 
                         primaryTurnover >= 1000 ? 5 : 0;
    
    const healthScore = Math.min(100, recencyScore + frequencyScore + monetaryScore);
    
    // Better RFM Segment logic
    let rfmSegment: 'champions' | 'loyal_customers' | 'potential_loyalists' | 'at_risk' | 'hibernating' = 'hibernating';
    if (healthScore >= 80 && recencyDays <= 30) rfmSegment = 'champions';
    else if (healthScore >= 60 && recencyDays <= 60) rfmSegment = 'loyal_customers';
    else if (healthScore >= 40 && recencyDays <= 90) rfmSegment = 'potential_loyalists';
    else if (healthScore >= 20 || (recencyDays <= 90 && totalTurnover > 0)) rfmSegment = 'at_risk';
    else rfmSegment = 'hibernating';
    
    // Improved risk assessment - customer is NOT at risk if they have recent activity
    const isAtRisk = (recencyDays > 90 && recent90dTurnover === 0) || 
                     (growthTrend === 'declining' && recencyDays > 60 && recent90dTurnover < 1000);
    
    // New customer check (first transaction in last 30 days)
    const isNewCustomer = firstTransactionDate && 
                          firstTransactionDate.getTime() >= (now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Debug logging for the specific customer
    if (customer.customer_code === 'CUS1TH0000309') {
      console.log('DEBUG CUS1TH0000309:', {
        totalSales: customerSales.length,
        totalTurnover,
        totalTransactions,
        lastTransactionDate: lastTransactionDate?.toISOString(),
        recencyDays,
        recent90dTurnover,
        recent90dTransactions,
        previous90dTurnover,
        growthTrend,
        healthScore,
        rfmSegment,
        isAtRisk,
        recencyScore,
        frequencyScore,
        monetaryScore
      });
    }
    
    return {
      customer_code: customer.customer_code,
      customer_name: customer.customer_name,
      search_name: customer.search_name,
      salesperson_code: customer.salesperson_code,
      customer_type_code: customer.customer_type_code,
      total_turnover: primaryTurnover, // Use 12-month turnover as primary metric for UI
      lifetime_turnover: totalTurnover, // Historical all-time turnover
      last_12_months_turnover: primaryTurnover, // Explicitly labeled 12-month turnover
      total_transactions: totalTransactions,
      active_days: new Set(customerSales.map(s => s.posting_date.split('T')[0])).size,
      first_transaction_date: firstTransactionDate?.toISOString().split('T')[0] || null,
      last_transaction_date: lastTransactionDate?.toISOString().split('T')[0] || null,
      recent_90d_turnover: recent90dTurnover,
      recent_90d_transactions: recent90dTransactions,
      previous_90d_turnover: previous90dTurnover,
      ytd_turnover: ytdTurnover,
      previous_year_turnover: 0, // Would need more complex calculation
      recency_days: recencyDays,
      frequency_per_month: frequencyPerMonth,
      monetary_value: primaryTurnover,
      growth_trend: growthTrend,
      health_score: healthScore,
      rfm_segment: rfmSegment,
      is_at_risk: isAtRisk,
      is_new_customer: isNewCustomer,
      activity_count: 0, // Simplified
      last_activity_date: null, // Simplified
      sample_request_count: 0, // Simplified
      last_sample_request_date: null, // Simplified
      average_order_value: totalTransactions > 0 ? primaryTurnover / totalTransactions : 0,
      days_since_last_activity: 9999, // Simplified
      computed_at: new Date().toISOString()
    };
  });
  
  // Apply filters to the computed analytics
  let filteredAnalytics = customerAnalytics;
  
  if (filters.healthScoreMin !== undefined) {
    filteredAnalytics = filteredAnalytics.filter(c => c.health_score >= filters.healthScoreMin!);
  }
  if (filters.healthScoreMax !== undefined) {
    filteredAnalytics = filteredAnalytics.filter(c => c.health_score <= filters.healthScoreMax!);
  }
  if (filters.rfmSegment) {
    filteredAnalytics = filteredAnalytics.filter(c => c.rfm_segment === filters.rfmSegment);
  }
  if (filters.isAtRisk !== undefined) {
    filteredAnalytics = filteredAnalytics.filter(c => c.is_at_risk === filters.isAtRisk);
  }
  if (filters.isNewCustomer !== undefined) {
    filteredAnalytics = filteredAnalytics.filter(c => c.is_new_customer === filters.isNewCustomer);
  }
  if (filters.growthTrend) {
    filteredAnalytics = filteredAnalytics.filter(c => c.growth_trend === filters.growthTrend);
  }
  if (filters.minTurnover !== undefined) {
    filteredAnalytics = filteredAnalytics.filter(c => c.total_turnover >= filters.minTurnover!);
  }
  if (filters.maxTurnover !== undefined) {
    filteredAnalytics = filteredAnalytics.filter(c => c.total_turnover <= filters.maxTurnover!);
  }
  if (filters.recencyDaysMax !== undefined) {
    filteredAnalytics = filteredAnalytics.filter(c => c.recency_days <= filters.recencyDaysMax!);
  }
  
  // Sort by health score descending, then by total turnover descending
  filteredAnalytics.sort((a, b) => {
    if (a.health_score !== b.health_score) {
      return b.health_score - a.health_score;
    }
    return b.total_turnover - a.total_turnover;
  });
  
  console.log('Computed customer analytics (fallback):', { count: filteredAnalytics.length });
  
  return filteredAnalytics;
};

export const useCustomerReportEnhanced = (
  filters: CustomerReportFilters = {}
) => {
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithAnalytics[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile, isAdmin } = useAuthStore();

  // Use React Query for caching and optimized data fetching
  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customerReportEnhanced', filters, profile?.spp_code, isAdmin],
    queryFn: () => fetchCustomersWithAnalytics(filters, profile, isAdmin),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!profile, // Only fetch when profile is available
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Use cached data on mount if available
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.customer_code.toLowerCase().includes(searchTermLower) ||
        customer.customer_name.toLowerCase().includes(searchTermLower) ||
        (customer.search_name && customer.search_name.toLowerCase().includes(searchTermLower))
    );

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  // Analytics summary - aligned with dashboard calculations
  const analytics = {
    totalCustomers: customers.length,
    totalTurnover: customers.reduce((sum, c) => sum + c.total_turnover, 0),
    averageHealthScore: customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.health_score, 0) / customers.length 
      : 0,
    atRiskCount: customers.filter(c => c.is_at_risk).length,
    newCustomerCount: customers.filter(c => c.is_new_customer).length,
    championsCount: customers.filter(c => c.rfm_segment === 'champions').length,
    segmentBreakdown: {
      champions: customers.filter(c => c.rfm_segment === 'champions').length,
      loyal_customers: customers.filter(c => c.rfm_segment === 'loyal_customers').length,
      potential_loyalists: customers.filter(c => c.rfm_segment === 'potential_loyalists').length,
      at_risk: customers.filter(c => c.rfm_segment === 'at_risk').length,
      hibernating: customers.filter(c => c.rfm_segment === 'hibernating').length,
    },
    trendBreakdown: {
      growing: customers.filter(c => c.growth_trend === 'growing').length,
      stable: customers.filter(c => c.growth_trend === 'stable').length,
      declining: customers.filter(c => c.growth_trend === 'declining').length,
    },
    // Dashboard alignment note: Using salesdata as primary source
    dataSource: 'salesdata',
    calculationMethod: 'last_12_months'
  };

  return {
    customers: filteredCustomers,
    allCustomers: customers,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    analytics,
    refetch,
    // Utility functions
    getHealthScoreColor: (score: number) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 60) return 'text-blue-600';
      if (score >= 40) return 'text-yellow-600';
      if (score >= 20) return 'text-orange-600';
      return 'text-red-600';
    },
    getRFMSegmentColor: (segment: string) => {
      switch (segment) {
        case 'champions': return 'bg-green-100 text-green-800';
        case 'loyal_customers': return 'bg-blue-100 text-blue-800';
        case 'potential_loyalists': return 'bg-yellow-100 text-yellow-800';
        case 'at_risk': return 'bg-orange-100 text-orange-800';
        case 'hibernating': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    },
    getGrowthTrendIcon: (trend: string) => {
      switch (trend) {
        case 'growing': return '📈';
        case 'declining': return '📉';
        default: return '➡️';
      }
    }
  };
};