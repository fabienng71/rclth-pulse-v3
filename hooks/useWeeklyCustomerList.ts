import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface WeeklyCustomerListItem {
  customer_code: string;
  customer_name: string;
  search_name: string;
  weekly_turnover: number;
  weekly_margin_amount: number;
  weekly_margin_percent: number;
  transaction_count: number;
  salesperson_code: string;
}

export const useWeeklyCustomerList = (
  year: number, 
  week: number, 
  selectedSalesperson: string, 
  includeCreditMemo: boolean = true,
  includeServices: boolean = false
) => {
  const { isAdmin, user } = useAuthStore();

  // Determine which salesperson code to use (same logic as other weekly hooks)
  const salespersonCode = (() => {
    if (!isAdmin) {
      return user?.profile?.spp_code || null;
    }
    return selectedSalesperson === 'all' ? null : selectedSalesperson;
  })();

  return useQuery({
    queryKey: ['weekly-customer-list', year, week, salespersonCode, isAdmin, includeCreditMemo, includeServices],
    queryFn: async () => {
      console.log(`[WeeklyCustomerList] Fetching data for year: ${year}, week: ${week}, salesperson: ${salespersonCode || 'all'}, includeCreditMemo: ${includeCreditMemo}, includeServices: ${includeServices}`);
      
      // Always use the old function signature for now (new functions not deployed properly)
      console.warn('[WeeklyCustomerList] Using old function signature - service transactions will be INCLUDED');
      
      const { data, error } = await supabase.rpc('get_weekly_customer_list', {
        p_year: year,
        p_week: week,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memo: includeCreditMemo,
      });

      if (error) {
        console.error('[WeeklyCustomerList] RPC call error:', error);
        throw error;
      }
      
      console.log(`[WeeklyCustomerList] RPC response (includeServices: ${includeServices}): ${data?.length || 0} customers`);
      return data as WeeklyCustomerListItem[];
    },
    enabled: !!user && week >= 1 && week <= 53,
    staleTime: 0, // Always refetch when parameters change
    cacheTime: 1000 * 60, // Keep in cache for 1 minute only
  });
};