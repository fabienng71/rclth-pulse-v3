
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface WeeklyProgressData {
  week_number: number;
  current_year_turnover: number;
  previous_year_turnover: number;
  current_year_running_total: number;
  previous_year_running_total: number;
  variance_percent: number;
}

export const useWeeklyProgressData = (year: number, week: number, selectedSalesperson: string, includeCreditMemo: boolean = true, includeServices: boolean = false) => {
  const { isAdmin, user } = useAuthStore();

  // Determine which salesperson code to use
  const salespersonCode = (() => {
    if (!isAdmin) {
      return user?.profile?.spp_code || null;
    }
    return selectedSalesperson === 'all' ? null : selectedSalesperson;
  })();

  return useQuery({
    queryKey: ['weekly-progress-data-v3', year, week, salespersonCode, isAdmin, includeCreditMemo, includeServices, 'aligned-with-metrics'],
    queryFn: async () => {
      console.log(`[WeeklyProgress] CACHE BUSTED - Fetching gross amounts for year: ${year}, week: ${week}, salesperson: ${salespersonCode || 'all'}`);
      console.log(`[WeeklyProgress] Parameters: includeCreditMemo: ${includeCreditMemo}, includeServices: ${includeServices}`);

      const { data, error } = await supabase.rpc('get_weekly_progress_data', {
        p_year: year,
        p_week: week,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memo: includeCreditMemo,
        p_include_services: includeServices,
      });

      if (error) {
        console.error('[WeeklyProgress] RPC call error:', error);
        throw error;
      }
      
      console.log(`[WeeklyProgress] FRESH Progress data response:`, data);
      
      // Find Week 36 for debugging
      const week36Data = data?.find((row: any) => row.week_number === 36);
      if (week36Data) {
        console.log(`[WeeklyProgress] Week 36 value: ${week36Data.current_year_turnover}`);
        console.log(`[WeeklyProgress] Should be 3,231,754.48:`, Number(week36Data.current_year_turnover) === 3231754.48 ? 'CORRECT' : 'NEEDS_FIX');
      }
      
      return data as WeeklyProgressData[];
    },
    enabled: !!user && week >= 14 && week <= 53,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
