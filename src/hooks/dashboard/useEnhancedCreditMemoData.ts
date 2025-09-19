import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';

interface CreditMemoSummary {
  lastDate: Date | null;
  totalAmount: number;
  count: number;
  impactPercentage: number;
  monthlyTrend: 'up' | 'down' | 'stable';
  isIncludedInCalculations: boolean;
}

export const useEnhancedCreditMemoData = (
  fromDate: Date,
  toDate: Date,
  salespersonCode?: string,
  totalTurnover?: number
) => {
  const { profile, isAdmin } = useAuthStore();

  const fetchCreditMemoSummary = async (): Promise<CreditMemoSummary> => {
    // Build base query
    let query = supabase
      .from('credit_memos')
      .select('posting_date, amount, amount_including_vat')
      .gte('posting_date', startOfMonth(fromDate).toISOString())
      .lte('posting_date', endOfMonth(toDate).toISOString())
      .eq('cancelled', false); // Exclude cancelled credit memos

    // Apply salesperson filtering
    if (isAdmin && salespersonCode) {
      query = query.eq('salesperson_code', salespersonCode);
    } else if (!isAdmin && profile?.spp_code) {
      query = query.eq('salesperson_code', profile.spp_code);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching credit memo summary:', error);
      throw new Error('Failed to fetch credit memo summary');
    }

    // Process the data
    const creditMemos = data || [];
    const totalAmount = creditMemos.reduce((sum, memo) => sum + (memo.amount || 0), 0);
    const count = creditMemos.length;

    // Find the most recent credit memo
    const sortedMemos = creditMemos.sort((a, b) => 
      new Date(b.posting_date).getTime() - new Date(a.posting_date).getTime()
    );
    const lastDate = sortedMemos.length > 0 ? new Date(sortedMemos[0].posting_date) : null;

    // Calculate impact percentage
    const impactPercentage = totalTurnover && totalTurnover > 0 
      ? (totalAmount / totalTurnover) * 100 
      : 0;

    // Calculate monthly trend (compare current period to previous period)
    const monthlyTrend = await calculateMonthlyTrend(fromDate, toDate, salespersonCode);

    return {
      lastDate,
      totalAmount,
      count,
      impactPercentage,
      monthlyTrend,
      isIncludedInCalculations: false // TODO: This should be determined by actual dashboard calculation logic
    };
  };

  const calculateMonthlyTrend = async (
    fromDate: Date,
    toDate: Date,
    salespersonCode?: string
  ): Promise<'up' | 'down' | 'stable'> => {
    try {
      // Calculate the previous period of the same length
      const periodLength = toDate.getTime() - fromDate.getTime();
      const previousFromDate = new Date(fromDate.getTime() - periodLength);
      const previousToDate = new Date(toDate.getTime() - periodLength);

      // Build query for previous period
      let query = supabase
        .from('credit_memos')
        .select('amount')
        .gte('posting_date', previousFromDate.toISOString())
        .lte('posting_date', previousToDate.toISOString())
        .eq('cancelled', false);

      // Apply salesperson filtering
      if (isAdmin && salespersonCode) {
        query = query.eq('salesperson_code', salespersonCode);
      } else if (!isAdmin && profile?.spp_code) {
        query = query.eq('salesperson_code', profile.spp_code);
      }

      const { data: previousData, error } = await query;

      if (error) {
        console.error('Error fetching previous period credit memos:', error);
        return 'stable';
      }

      const previousTotal = (previousData || []).reduce((sum, memo) => sum + (memo.amount || 0), 0);
      
      // Get current period data
      const currentData = await fetchCurrentPeriodData(fromDate, toDate, salespersonCode);
      const currentTotal = currentData.reduce((sum, memo) => sum + (memo.amount || 0), 0);

      // Calculate trend
      const difference = currentTotal - previousTotal;
      const threshold = Math.max(previousTotal * 0.1, 100); // 10% threshold or minimum $100

      if (Math.abs(difference) < threshold) {
        return 'stable';
      }

      return difference > 0 ? 'up' : 'down';
    } catch (error) {
      console.error('Error calculating monthly trend:', error);
      return 'stable';
    }
  };

  const fetchCurrentPeriodData = async (
    fromDate: Date,
    toDate: Date,
    salespersonCode?: string
  ) => {
    let query = supabase
      .from('credit_memos')
      .select('amount')
      .gte('posting_date', startOfMonth(fromDate).toISOString())
      .lte('posting_date', endOfMonth(toDate).toISOString())
      .eq('cancelled', false);

    if (isAdmin && salespersonCode) {
      query = query.eq('salesperson_code', salespersonCode);
    } else if (!isAdmin && profile?.spp_code) {
      query = query.eq('salesperson_code', profile.spp_code);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  };

  const {
    data: creditMemoSummary,
    isLoading,
    error
  } = useQuery({
    queryKey: [
      'enhancedCreditMemoSummary',
      fromDate.toISOString(),
      toDate.toISOString(),
      isAdmin,
      profile?.spp_code,
      salespersonCode,
      totalTurnover
    ],
    queryFn: fetchCreditMemoSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!profile,
  });

  return {
    creditMemoSummary,
    isLoading,
    error
  };
};