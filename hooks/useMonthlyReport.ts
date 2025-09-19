import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useRef } from 'react';

export interface MonthlyReportData {
  customer_code: string;
  customer_name: string;
  search_name: string | null;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  margin_percent: number;
  credit_memo_amount: number;
  net_turnover: number;
  net_margin: number;
  net_margin_percent: number;
  transaction_count: number;
}

export interface MonthlyReportSummary {
  total_customers: number;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  average_margin_percent: number;
  total_credit_memos: number;
  net_turnover: number;
  net_margin: number;
  net_margin_percent: number;
  total_transactions: number;
}

export interface MonthlyReportOptions {
  includeCreditMemos: boolean;
}

export interface CustomerProductData {
  item_code: string;
  item_description: string;
  quantity: number;
  amount: number;
  unit_cost: number;
  total_cost: number;
  margin_amount: number;
  margin_percent: number;
  transaction_count: number;
  avg_unit_price: number;
}

export const useMonthlyReport = (
  year: number,
  month: number,
  selectedSalesperson: string,
  options: MonthlyReportOptions = { includeCreditMemos: true }
) => {
  const { isAdmin, user, profile } = useAuthStore();

  // Debug logging for user profile and filtering
  console.log('=== MONTHLY REPORT: User profile debug ===', {
    isAdmin,
    userId: user?.id,
    userEmail: user?.email,
    profileSppCode: profile?.spp_code,
    userSppCode: user?.spp_code,
    selectedSalesperson,
    hasProfile: !!profile,
    filteringMode: isAdmin ? 'admin-mode' : 'user-mode'
  });

  // Determine which salesperson code to use with better fallback logic
  const salespersonCode = (() => {
    if (!isAdmin) {
      // For non-admin users, always use their own salesperson code
      const userCode = profile?.spp_code;
      console.log('=== MONTHLY REPORT: Non-admin user code ===', userCode);
      return userCode || null;
    }
    
    // For admin users, use selected salesperson or null for "all"
    const adminCode = selectedSalesperson === 'all' ? null : selectedSalesperson;
    console.log('=== MONTHLY REPORT: Admin selected code ===', adminCode);
    return adminCode;
  })();

  console.log('=== MONTHLY REPORT: Final salesperson code ===', salespersonCode);

  // Cache invalidation when salesperson changes
  const queryClient = useQueryClient();
  const prevSalespersonCode = useRef(salespersonCode);
  
  useEffect(() => {
    if (prevSalespersonCode.current !== salespersonCode) {
      console.log('=== MONTHLY REPORT: Salesperson changed, invalidating cache ===', {
        previous: prevSalespersonCode.current,
        current: salespersonCode
      });
      
      // Invalidate all monthly report queries to force fresh data
      queryClient.invalidateQueries({
        queryKey: ['monthly-report']
      });
      
      prevSalespersonCode.current = salespersonCode;
    }
  }, [salespersonCode, queryClient]);

  // Fetch monthly report data
  const {
    data: rawData,
    isLoading,
    error,
    dataUpdatedAt,
    isFetching,
    isRefetching,
  } = useQuery({
    queryKey: ['monthly-report', year, month, salespersonCode, isAdmin, options.includeCreditMemos],
    queryFn: async () => {
      console.log('=== MONTHLY REPORT: 🚀 DATABASE QUERY TRIGGERED ===');
      console.log('=== MONTHLY REPORT: Query triggered at ===', new Date().toISOString());
      console.log('=== MONTHLY REPORT: Calling database function ===', {
        p_year: year,
        p_month: month,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memos: options.includeCreditMemos,
        queryState: { isFetching, isRefetching }
      });

      const { data, error } = await supabase.rpc('get_monthly_customer_report', {
        p_year: year,
        p_month: month,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memos: options.includeCreditMemos,
      });

      if (error) {
        console.error('=== MONTHLY REPORT: Database error ===', error);
        // Add more specific error details for debugging
        if (error.code === 'PGRST116') {
          throw new Error('Monthly report function not found. Please check database migration status.');
        } else if (error.code === '42P01') {
          throw new Error('Database table not found. Please check if all required tables exist.');
        } else if (error.message?.includes('permission denied')) {
          throw new Error('Insufficient database permissions. Please contact your administrator.');
        }
        throw new Error(`Database error: ${error.message || 'Unknown error occurred'}`);
      }
      
      console.log('=== MONTHLY REPORT: Raw data received ===', data?.length || 0, 'rows');
      console.log('=== MONTHLY REPORT: 🏁 Query completed successfully at ===', new Date().toISOString());
      
      // Log first few customer codes for verification
      if (data && data.length > 0) {
        console.log('=== MONTHLY REPORT: Sample customer codes ===', data.slice(0, 3).map(d => d.customer_code));
      }
      
      return data || [];
    },
    enabled: !!user && (!isAdmin ? !!salespersonCode && !!profile : true),
    staleTime: 30 * 1000, // 30 second cache (very short for debugging)
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always fetch on mount for fresh data
    retry: 2, // Retry failed requests twice
  });
  
  // Debug log query state changes
  useEffect(() => {
    console.log('=== MONTHLY REPORT: Query state update ===', {
      isLoading,
      isFetching,
      isRefetching,
      hasData: !!rawData,
      dataLength: rawData?.length || 0,
      lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : 'never'
    });
  }, [isLoading, isFetching, isRefetching, rawData, dataUpdatedAt]);
  
  // Debug log query key changes
  useEffect(() => {
    const queryKey = ['monthly-report', year, month, salespersonCode, isAdmin, options.includeCreditMemos];
    console.log('=== MONTHLY REPORT: Query key changed ===', {
      queryKey,
      timestamp: new Date().toISOString()
    });
  }, [year, month, salespersonCode, isAdmin, options.includeCreditMemos]);

  // Process the data
  const processedData: MonthlyReportData[] = rawData?.map((row: any) => ({
    customer_code: row.customer_code,
    customer_name: row.customer_name,
    search_name: row.search_name,
    total_turnover: Number(row.total_turnover),
    total_cost: Number(row.total_cost),
    total_margin: Number(row.total_margin),
    margin_percent: Number(row.margin_percent),
    credit_memo_amount: Number(row.credit_memo_amount),
    net_turnover: Number(row.net_turnover),
    net_margin: Number(row.net_margin),
    net_margin_percent: Number(row.net_margin_percent),
    transaction_count: Number(row.transaction_count),
  })) || [];

  // Calculate summary statistics
  const summary: MonthlyReportSummary = {
    total_customers: processedData.length,
    total_turnover: processedData.reduce((sum, row) => sum + row.total_turnover, 0),
    total_cost: processedData.reduce((sum, row) => sum + row.total_cost, 0),
    total_margin: processedData.reduce((sum, row) => sum + row.total_margin, 0),
    average_margin_percent: processedData.length > 0 
      ? processedData.reduce((sum, row) => sum + row.margin_percent, 0) / processedData.length 
      : 0,
    total_credit_memos: processedData.reduce((sum, row) => sum + row.credit_memo_amount, 0),
    net_turnover: processedData.reduce((sum, row) => sum + row.net_turnover, 0),
    net_margin: processedData.reduce((sum, row) => sum + row.net_margin, 0),
    net_margin_percent: 0,
    total_transactions: processedData.reduce((sum, row) => sum + row.transaction_count, 0),
  };

  // Calculate net margin percentage
  if (summary.net_turnover > 0) {
    summary.net_margin_percent = (summary.net_margin / summary.net_turnover) * 100;
  }

  return {
    data: processedData,
    summary,
    isLoading,
    error,
    debugInfo: {
      isAdmin,
      salespersonCode,
      hasData: rawData?.length > 0,
      userProfile: profile?.spp_code,
      selectedSalesperson,
      filteringCorrectly: isAdmin 
        ? (selectedSalesperson === 'all' ? salespersonCode === null : salespersonCode === selectedSalesperson) 
        : salespersonCode === profile?.spp_code,
      profileLoaded: !!profile,
      queryParams: {
        p_year: year,
        p_month: month,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memos: options.includeCreditMemos,
      },
      lastUpdated: dataUpdatedAt,
      queryKey: ['monthly-report', year, month, salespersonCode, isAdmin, options.includeCreditMemos],
      queryState: {
        isLoading,
        isFetching,
        isRefetching,
        enabled: !!user && (!isAdmin ? !!salespersonCode && !!profile : true)
      },
      expectedBehavior: {
        shouldShowAllData: isAdmin && selectedSalesperson === 'all',
        shouldFilterByCode: isAdmin ? selectedSalesperson !== 'all' : true,
        effectiveFilterCode: salespersonCode
      }
    }
  };
};