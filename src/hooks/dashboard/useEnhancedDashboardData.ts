import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { 
  DashboardSummary, 
  EnhancedMonthlyTurnover, 
  DashboardMetrics,
  GetDashboardSummaryResponse 
} from '@/types/dashboard';

export const useEnhancedDashboardData = (
  fromDate: Date,
  toDate: Date,
  salespersonCode?: string
) => {
  const { profile, isAdmin } = useAuthStore();

  const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    // FIXED: Properly handle "All Salespeople" selection
    // Admin + "all" → empty string (show all data)
    // Admin + specific code → that code (filter to specific salesperson)  
    // Non-admin → their own code (filter to their own data)
    const effectiveSalespersonCode = isAdmin 
      ? (salespersonCode && salespersonCode !== 'all' ? salespersonCode : '')
      : (profile?.spp_code || '');

    // Fix timezone issue: Send date-only strings instead of timezone-converted ISO strings
    const fromDateStr = format(startOfMonth(fromDate), 'yyyy-MM-dd');
    const toDateStr = format(endOfMonth(toDate), 'yyyy-MM-dd');

    console.log('Fetching enhanced dashboard data with params (SIMPLIFIED):', {
      from_date: fromDateStr,
      to_date: toDateStr,
      is_admin: isAdmin,
      user_spp_code: effectiveSalespersonCode,
      timezone_fix_applied: true
    });

    const { data, error } = await supabase.rpc('get_simple_dashboard_summary', {
      from_date: fromDateStr,
      to_date: toDateStr,
      is_admin: isAdmin,
      user_spp_code: effectiveSalespersonCode
    });

    if (error) {
      console.error('Error fetching dashboard summary:', error);
      throw new Error('Failed to fetch dashboard summary');
    }

    if (!data || data.length === 0) {
      console.error('No data returned from dashboard summary RPC');
      throw new Error('No dashboard data available');
    }

    const summaryData = data[0] as GetDashboardSummaryResponse;
    
    // Parse monthly data from JSON
    const monthlyData: EnhancedMonthlyTurnover[] = summaryData.monthly_data 
      ? (Array.isArray(summaryData.monthly_data) 
          ? summaryData.monthly_data 
          : JSON.parse(summaryData.monthly_data))
      : [];

    // Transform the data
    const transformedMonthlyData: EnhancedMonthlyTurnover[] = monthlyData.map(item => ({
      month: item.month,
      total_quantity: Number(item.total_quantity) || 0,
      total_turnover: Number(item.total_turnover) || 0,
      total_cost: Number(item.total_cost) || 0,
      total_margin: Number(item.total_margin) || 0,
      margin_percent: Number(item.margin_percent) || 0,
      credit_memo_amount: Number(item.credit_memo_amount) || 0,
      credit_memo_count: Number(item.credit_memo_count) || 0,
      net_turnover: Number(item.net_turnover) || 0,
      net_margin: Number(item.net_margin) || 0,
      net_margin_percent: Number(item.net_margin_percent) || 0,
      credit_memo_impact_percent: Number(item.credit_memo_impact_percent) || 0,
      delivery_fee_amount: Number(item.delivery_fee_amount) || 0,
      delivery_fee_count: Number(item.delivery_fee_count) || 0,
      delivery_fee_impact_percent: Number(item.delivery_fee_impact_percent) || 0,
      net_turnover_excl_delivery: Number(item.net_turnover_excl_delivery) || 0,
      net_margin_excl_delivery: Number(item.net_margin_excl_delivery) || 0,
      display_month: formatDisplayMonth(item.month)
    }));

    return {
      monthly_data: transformedMonthlyData,
      total_turnover: Number(summaryData.total_turnover) || 0,
      total_cost: Number(summaryData.total_cost) || 0,
      total_margin: Number(summaryData.total_margin) || 0,
      total_credit_memos: Number(summaryData.total_credit_memos) || 0,
      net_turnover: Number(summaryData.net_turnover) || 0,
      net_margin: Number(summaryData.net_margin) || 0,
      credit_memo_impact_percent: Number(summaryData.credit_memo_impact_percent) || 0,
      last_sales_date: summaryData.last_sales_date ? parseISO(summaryData.last_sales_date) : null,
      last_credit_memo_date: summaryData.last_credit_memo_date ? parseISO(summaryData.last_credit_memo_date) : null,
      last_transaction_date: summaryData.last_transaction_date ? parseISO(summaryData.last_transaction_date) : null,
      total_transactions: Number(summaryData.total_transactions) || 0,
      credit_memo_count: Number(summaryData.credit_memo_count) || 0,
      company_total_turnover: Number(summaryData.company_total_turnover) || 0
    };
  };

  const formatDisplayMonth = (monthStr: string): string => {
    try {
      const date = parseISO(`${monthStr}-01`);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return monthStr;
    }
  };

  const {
    data: dashboardSummary,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'simpleDashboardSummary',
      fromDate.toISOString(),
      toDate.toISOString(),
      isAdmin,
      profile?.spp_code,
      salespersonCode
    ],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!profile,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Derived metrics for easier consumption
  const dashboardMetrics: DashboardMetrics | undefined = dashboardSummary ? {
    totalTurnover: dashboardSummary.total_turnover,
    totalCost: dashboardSummary.total_cost,
    totalMargin: dashboardSummary.total_margin,
    marginPercent: dashboardSummary.total_turnover > 0 
      ? (dashboardSummary.total_margin / dashboardSummary.total_turnover) * 100 
      : 0,
    totalCreditMemos: dashboardSummary.total_credit_memos,
    netTurnover: dashboardSummary.net_turnover,
    netMargin: dashboardSummary.net_margin,
    netMarginPercent: dashboardSummary.net_turnover > 0 
      ? (dashboardSummary.net_margin / dashboardSummary.net_turnover) * 100 
      : 0,
    creditMemoImpact: dashboardSummary.credit_memo_impact_percent,
    lastSalesDate: dashboardSummary.last_sales_date,
    lastCreditMemoDate: dashboardSummary.last_credit_memo_date,
    lastTransactionDate: dashboardSummary.last_transaction_date,
    totalTransactions: dashboardSummary.total_transactions,
    creditMemoCount: dashboardSummary.credit_memo_count,
    companyTotalTurnover: dashboardSummary.company_total_turnover,
    salespersonContribution: dashboardSummary.company_total_turnover > 0 
      ? (dashboardSummary.total_turnover / dashboardSummary.company_total_turnover) * 100 
      : 0
  } : undefined;

  // Calculate monthly average
  const monthlyAverageTurnover = dashboardSummary?.monthly_data.length 
    ? dashboardSummary.net_turnover / dashboardSummary.monthly_data.length 
    : 0;

  // Credit memo summary
  const creditMemoSummary = dashboardSummary ? {
    lastDate: dashboardSummary.last_credit_memo_date,
    totalAmount: dashboardSummary.total_credit_memos,
    count: dashboardSummary.credit_memo_count,
    impactPercentage: dashboardSummary.credit_memo_impact_percent,
    monthlyTrend: calculateCreditMemoTrend(dashboardSummary.monthly_data),
    isIncludedInCalculations: true // Always included in simplified dashboard
  } : null;

  return {
    dashboardSummary,
    dashboardMetrics,
    monthlyAverageTurnover,
    creditMemoSummary,
    isLoading,
    error,
    refetch
  };
};

// Helper function to calculate credit memo trend
const calculateCreditMemoTrend = (monthlyData: EnhancedMonthlyTurnover[]): 'up' | 'down' | 'stable' => {
  if (monthlyData.length < 2) return 'stable';
  
  const sortedData = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
  const lastMonth = sortedData[sortedData.length - 1];
  const previousMonth = sortedData[sortedData.length - 2];
  
  const lastAmount = lastMonth.credit_memo_amount;
  const previousAmount = previousMonth.credit_memo_amount;
  
  if (Math.abs(lastAmount - previousAmount) < 100) return 'stable';
  
  return lastAmount > previousAmount ? 'up' : 'down';
};


// Fallback hook for backward compatibility
export const useEnhancedTurnoverData = (
  fromDate: Date,
  toDate: Date,
  salespersonCode?: string
) => {
  const { dashboardSummary, dashboardMetrics, isLoading, error } = useEnhancedDashboardData(
    fromDate,
    toDate,
    salespersonCode
  );

  return {
    // Legacy format
    totalTurnover: dashboardMetrics?.totalTurnover,
    isLoadingTotal: isLoading,
    totalError: error,
    monthlyTurnover: dashboardSummary?.monthly_data,
    isLoadingMonthly: isLoading,
    monthlyError: error,
    lastTransactionDate: dashboardMetrics?.lastTransactionDate,
    isLoadingLastTransaction: isLoading,
    lastTransactionError: error,
    totalCompanyTurnover: dashboardMetrics?.companyTotalTurnover,
    isLoadingCompanyTotal: isLoading,
    companyTotalError: error,
    lastSalesDate: dashboardMetrics?.lastSalesDate,
    isLoadingLastSales: isLoading,
    lastSalesError: error,
    lastCreditMemoDate: dashboardMetrics?.lastCreditMemoDate,
    isLoadingLastCreditMemo: isLoading,
    lastCreditMemoError: error,
    
    // Enhanced data
    netTurnover: dashboardMetrics?.netTurnover,
    netMargin: dashboardMetrics?.netMargin,
    totalCreditMemos: dashboardMetrics?.totalCreditMemos,
    creditMemoImpact: dashboardMetrics?.creditMemoImpact,
    creditMemoCount: dashboardMetrics?.creditMemoCount
  };
};