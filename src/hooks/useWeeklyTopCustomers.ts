
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface WeeklyTopCustomer {
  period_type: 'current' | 'previous';
  customer_code: string;
  search_name: string;
  turnover: number;
  rank_position: number;
}

export const useWeeklyTopCustomers = (year: number, week: number, selectedSalesperson: string, includeCreditMemo: boolean = true, includeServices: boolean = false) => {
  const { isAdmin, user } = useAuthStore();

  // Determine which salesperson code to use
  const salespersonCode = (() => {
    if (!isAdmin) {
      return user?.profile?.spp_code || null;
    }
    return selectedSalesperson === 'all' ? null : selectedSalesperson;
  })();

  return useQuery({
    queryKey: ['weekly-top-customers', year, week, salespersonCode, isAdmin, includeCreditMemo, includeServices],
    queryFn: async () => {
      console.log(`[WeeklyTopCustomers] Fetching data for year: ${year}, week: ${week}, salesperson: ${salespersonCode || 'all'}, includeCreditMemo: ${includeCreditMemo}, includeServices: ${includeServices}`);
      
      // Always use the old function signature for now (new functions not deployed properly)
      console.warn('[WeeklyTopCustomers] Using old function signature - service transactions will be INCLUDED');
      
      const { data, error } = await supabase.rpc('get_weekly_top_customers', {
        p_year: year,
        p_week: week,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memo: includeCreditMemo,
      });

      if (error) {
        console.error('[WeeklyTopCustomers] RPC call error:', error);
        throw error;
      }
      
      console.log(`[WeeklyTopCustomers] RPC response (includeServices: ${includeServices}):`, data);
      return data as WeeklyTopCustomer[];
    },
    enabled: !!user && week >= 1 && week <= 53,
    staleTime: 0, // Always refetch when parameters change
    cacheTime: 1000 * 60, // Keep in cache for 1 minute only
  });
};
