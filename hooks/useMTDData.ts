
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface MTDDayData {
  day_of_month: number;
  current_year_sales: number;
  previous_year_sales: number;
  running_total_current_year: number;
  running_total_previous_year: number;
  weekday_name: string;
  variance_percent: number;
  is_weekend: boolean;
  is_holiday: boolean;
}

export interface MTDSummary {
  current_year_total: number;
  previous_year_total: number;
  total_variance_percent: number;
  current_year_avg_daily: number;
  previous_year_avg_daily: number;
  working_days_passed: number;
  total_working_days: number;
  target_amount?: number;
  target_achievement_percent?: number;
}

export interface MTDDataOptions {
  includeDeliveryFees: boolean;
  includeCreditMemos: boolean;
}

export const useMTDData = (
  year: number, 
  month: number, 
  selectedSalesperson: string,
  options: MTDDataOptions = { includeDeliveryFees: false, includeCreditMemos: true }
) => {
  const { isAdmin, user, profile } = useAuthStore();
  const [holidays, setHolidays] = useState<Date[]>([]);

  // Debug logging for user profile and filtering
  console.log('=== MTD DATA: User profile debug ===', {
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
      console.log('=== MTD DATA: Non-admin user code ===', userCode);
      return userCode || null;
    }
    
    // For admin users, use selected salesperson or null for "all"
    const adminCode = selectedSalesperson === 'all' ? null : selectedSalesperson;
    console.log('=== MTD DATA: Admin selected code ===', adminCode);
    return adminCode;
  })();

  console.log('=== MTD DATA: Final salesperson code ===', salespersonCode);

  // Fetch holidays for the year
  const { data: holidayData } = useQuery({
    queryKey: ['holidays', year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_holidays')
        .select('holiday_date')
        .gte('holiday_date', `${year}-01-01`)
        .lte('holiday_date', `${year}-12-31`);
      
      if (error) throw error;
      return data?.map(h => new Date(h.holiday_date)) || [];
    },
  });

  // Fetch sales target for current period and salesperson
  const { data: targetData } = useQuery({
    queryKey: ['sales-target', year, month, salespersonCode],
    queryFn: async () => {
      if (!salespersonCode) return null;
      
      const { data, error } = await supabase
        .rpc('get_sales_target_amount', {
          p_year: year,
          p_month: month,
          p_salesperson_code: salespersonCode
        });
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sales target:', error);
      }
      
      return Number(data) || 0;
    },
    enabled: !!salespersonCode,
  });

  // Fetch aggregated sales target for "all salesperson" view
  const { data: aggregatedTargetData } = useQuery({
    queryKey: ['aggregated-sales-target', year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_aggregated_sales_target_amount', {
          p_year: year,
          p_month: month
        });
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching aggregated sales target:', error);
      }
      
      return Number(data) || 0;
    },
    enabled: !salespersonCode, // Only when "all salesperson" is selected
  });

  // Fetch MTD data - use computed salespersonCode in query key
  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['mtd-data', year, month, salespersonCode, isAdmin, options, aggregatedTargetData],
    queryFn: async () => {
      console.log('=== MTD DATA: Calling database function ===', {
        p_year: year,
        p_month: month,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_delivery_fees: options.includeDeliveryFees,
        p_include_credit_memos: options.includeCreditMemos,
      });

      const { data, error } = await supabase.rpc('get_daily_sales_mtd', {
        p_year: year,
        p_month: month,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_delivery_fees: options.includeDeliveryFees,
        p_include_credit_memos: options.includeCreditMemos,
      });

      if (error) {
        console.error('=== MTD DATA: Database error ===', error);
        throw error;
      }
      
      console.log('=== MTD DATA: Raw data received ===', data?.length || 0, 'rows');
      return data || [];
    },
    enabled: !!user && (!isAdmin ? !!salespersonCode && !!profile : true), // For non-admin, ensure profile is loaded
  });

  // Helper function to check if a date is a working day - now uses local timezone
  const isWorkingDay = (day: number, month: number, year: number) => {
    // Create date in local timezone (same as the corrected database function)
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (Sunday = 0, Saturday = 6)
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    
    // Skip holidays - compare dates properly
    const isHoliday = holidayData?.some(holiday => {
      const holidayLocalDate = new Date(holiday);
      return holidayLocalDate.getDate() === day && 
             holidayLocalDate.getMonth() === month - 1 && 
             holidayLocalDate.getFullYear() === year;
    }) || false;
    
    return !isHoliday;
  };

  // Calculate working days
  const calculateWorkingDays = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDate = new Date();
    const today = new Date().getDate();
    const isCurrentMonth = currentDate.getFullYear() === year && currentDate.getMonth() + 1 === month;
    
    let totalWorkingDays = 0;
    let workingDaysPassed = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      if (isWorkingDay(day, month, year)) {
        totalWorkingDays++;
        
        // Count working days passed (up to today if current month, or all if past month)
        if (!isCurrentMonth || day <= today) {
          workingDaysPassed++;
        }
      }
    }
    
    return { totalWorkingDays, workingDaysPassed };
  };

  // Process the data - running totals now calculated in database
  const processedData: MTDDayData[] = rawData?.map((day: any) => {
    return {
      day_of_month: day.day_of_month,
      current_year_sales: Number(day.current_year_sales),
      previous_year_sales: Number(day.previous_year_sales),
      running_total_current_year: Number(day.running_total_current_year),
      running_total_previous_year: Number(day.running_total_previous_year),
      weekday_name: day.weekday_name.trim(),
      variance_percent: Number(day.variance_percent),
      is_weekend: day.is_weekend,
      is_holiday: day.is_holiday,
    };
  }) || [];

  // Calculate working days metrics
  const { totalWorkingDays, workingDaysPassed } = calculateWorkingDays();

  // Calculate summary with corrected daily averages and target data
  const finalDay = processedData[processedData.length - 1];
  
  // Use appropriate target amount based on selection
  const targetAmount = salespersonCode ? (targetData || 0) : (aggregatedTargetData || 0);
  
  const summary: MTDSummary = {
    current_year_total: finalDay?.running_total_current_year || 0,
    previous_year_total: finalDay?.running_total_previous_year || 0,
    total_variance_percent: finalDay?.variance_percent || 0,
    current_year_avg_daily: 0,
    previous_year_avg_daily: 0,
    working_days_passed: workingDaysPassed,
    total_working_days: totalWorkingDays,
    target_amount: targetAmount,
    target_achievement_percent: 0,
  };

  // Calculate daily averages based on working days passed
  summary.current_year_avg_daily = workingDaysPassed > 0 ? summary.current_year_total / workingDaysPassed : 0;
  summary.previous_year_avg_daily = workingDaysPassed > 0 ? summary.previous_year_total / workingDaysPassed : 0;

  // Calculate target achievement percentage
  if (summary.target_amount && summary.target_amount > 0) {
    summary.target_achievement_percent = (summary.current_year_total / summary.target_amount) * 100;
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
      filteringCorrectly: isAdmin ? (selectedSalesperson === 'all' ? salespersonCode === null : salespersonCode === selectedSalesperson) : salespersonCode === profile?.spp_code,
      profileLoaded: !!profile,
      targetType: salespersonCode ? 'individual' : 'aggregated',
      individualTarget: targetData || 0,
      aggregatedTarget: aggregatedTargetData || 0,
      finalTargetUsed: targetAmount,
    }
  };
};
