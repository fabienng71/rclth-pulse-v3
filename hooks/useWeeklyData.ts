
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { getWeek } from 'date-fns';

export interface WeeklyData {
  current_week_turnover: number;
  previous_year_week_turnover: number;
  current_week_start: string;
  current_week_end: string;
  previous_year_week_start: string;
  previous_year_week_end: string;
}

export interface WeeklySummary {
  current_week_turnover: number;
  previous_year_week_turnover: number;
  variance_percent: number;
  week_start: Date;
  week_end: Date;
}

export const useWeeklyData = (
  year: number, 
  week: number, 
  selectedSalesperson: string, 
  includeCreditMemo: boolean = true, 
  includeServices: boolean = true
) => {
  const { isAdmin, user } = useAuthStore();

  // Determine which salesperson code to use
  const salespersonCode = (() => {
    if (!isAdmin) {
      return user?.profile?.spp_code || null;
    }
    return selectedSalesperson === 'all' ? null : selectedSalesperson;
  })();

  // Fetch weekly turnover data
  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['weekly-data-v3', year, week, salespersonCode, isAdmin, includeCreditMemo, includeServices, 'gross-turnover'],
    queryFn: async () => {
      console.log(`[useWeeklyData] GROSS TURNOVER - Fetching for year: ${year}, week: ${week}, salesperson: ${salespersonCode || 'all'}`);
      console.log(`[useWeeklyData] Parameters: includeCreditMemo=${includeCreditMemo}, includeServices=${includeServices}`);
      
      const { data, error } = await supabase.rpc('get_weekly_turnover_data', {
        p_year: year,
        p_week: week,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memo: includeCreditMemo,
        p_include_services: includeServices,
      });

      if (error) {
        console.error('Weekly data fetch error:', error);
        throw error;
      }
      
      console.log(`[useWeeklyData] GROSS TURNOVER Response:`, data?.[0]);
      console.log(`[useWeeklyData] Current week GROSS turnover:`, data?.[0]?.current_week_turnover);
      console.log(`[useWeeklyData] Week 36 should be 3,231,754.48:`, data?.[0]?.current_week_turnover === 3231754.48 ? 'CORRECT' : 'NEEDS_CHECK');
      return data?.[0] || null;
    },
    enabled: !!user && week >= 1 && week <= 53,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Process the data with variance calculation
  const summary: WeeklySummary | null = rawData ? {
    current_week_turnover: Number(rawData.current_week_turnover),
    previous_year_week_turnover: Number(rawData.previous_year_week_turnover),
    variance_percent: rawData.previous_year_week_turnover > 0 
      ? ((Number(rawData.current_week_turnover) - Number(rawData.previous_year_week_turnover)) / Number(rawData.previous_year_week_turnover)) * 100
      : Number(rawData.current_week_turnover) > 0 ? 100 : 0,
    week_start: new Date(rawData.current_week_start),
    week_end: new Date(rawData.current_week_end),
  } : null;

  return {
    data: rawData,
    summary,
    isLoading,
    error,
  };
};
