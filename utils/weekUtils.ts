
import { supabase } from '@/integrations/supabase/client';

/**
 * Week utilities now using the weeks table with ISO 8601 business week definition
 * This replaces the previous date calculation approach for consistency and accuracy
 */

export interface WeekData {
  year: number;
  week_number: number;
  start_date: string;
  end_date: string;
}

/**
 * Get week data from the weeks table
 */
export const getWeekData = async (year: number, week: number): Promise<WeekData | null> => {
  const { data, error } = await supabase
    .from('weeks')
    .select('year, week_number, start_date, end_date')
    .eq('year', year)
    .eq('week_number', week)
    .single();

  if (error || !data) {
    console.error('Error fetching week data:', error);
    return null;
  }

  return data;
};

/**
 * Get all weeks for a specific year
 */
export const getWeeksForYear = async (year: number): Promise<WeekData[]> => {
  const { data, error } = await supabase
    .from('weeks')
    .select('year, week_number, start_date, end_date')
    .eq('year', year)
    .order('week_number');

  if (error) {
    console.error('Error fetching weeks for year:', error);
    return [];
  }

  return data || [];
};

/**
 * Get the current week number for a given date using the weeks table
 */
export const getCurrentWeekNumber = async (date: Date = new Date()): Promise<number> => {
  const year = date.getFullYear();
  const dateStr = date.toISOString().split('T')[0];

  console.log(`[getCurrentWeekNumber] Looking for week containing ${dateStr} in year ${year}`);

  const { data, error } = await supabase
    .from('weeks')
    .select('week_number, start_date, end_date')
    .eq('year', year)
    .lte('start_date', dateStr)
    .gte('end_date', dateStr)
    .single();

  if (error || !data) {
    console.warn(`[getCurrentWeekNumber] Could not determine current week for ${dateStr}, defaulting to week 1. Error:`, error);
    return 1;
  }

  console.log(`[getCurrentWeekNumber] Date ${dateStr} falls in week ${data.week_number} (${data.start_date} to ${data.end_date})`);
  return data.week_number;
};

/**
 * Debug function to check what week a specific date falls into
 */
export const debugWeekForDate = async (date: Date): Promise<void> => {
  const year = date.getFullYear();
  const dateStr = date.toISOString().split('T')[0];
  
  console.log(`[debugWeekForDate] Checking week for date: ${dateStr}`);
  
  const { data: allWeeks, error: allError } = await supabase
    .from('weeks')
    .select('week_number, start_date, end_date')
    .eq('year', year)
    .order('week_number');
    
  if (allError) {
    console.error('[debugWeekForDate] Error fetching all weeks:', allError);
    return;
  }
  
  console.log(`[debugWeekForDate] All weeks for ${year}:`, allWeeks);
  
  const matchingWeek = allWeeks?.find(week => 
    dateStr >= week.start_date && dateStr <= week.end_date
  );
  
  if (matchingWeek) {
    console.log(`[debugWeekForDate] Date ${dateStr} matches Week ${matchingWeek.week_number} (${matchingWeek.start_date} to ${matchingWeek.end_date})`);
  } else {
    console.log(`[debugWeekForDate] Date ${dateStr} does not match any week boundaries`);
  }
};

/**
 * Ensure weeks table is populated for a given year
 */
export const ensureWeeksPopulated = async (year: number): Promise<void> => {
  console.log(`[ensureWeeksPopulated] Checking if weeks are populated for year ${year}`);
  
  const { data: existingWeeks, error } = await supabase
    .from('weeks')
    .select('week_number')
    .eq('year', year);
    
  if (error) {
    console.error('[ensureWeeksPopulated] Error checking existing weeks:', error);
    return;
  }
  
  if (!existingWeeks || existingWeeks.length === 0) {
    console.log(`[ensureWeeksPopulated] No weeks found for ${year}, populating...`);
    
    const { error: populateError } = await supabase.rpc('populate_weeks_table', {
      start_year: year,
      end_year: year
    });
    
    if (populateError) {
      console.error('[ensureWeeksPopulated] Error populating weeks:', populateError);
    } else {
      console.log(`[ensureWeeksPopulated] Successfully populated weeks for ${year}`);
    }
  } else {
    console.log(`[ensureWeeksPopulated] Found ${existingWeeks.length} weeks for ${year}`);
  }
};

/**
 * Get the start and end dates for a specific week in a year
 */
export const getWeekBoundaries = async (year: number, week: number): Promise<{ start: Date; end: Date } | null> => {
  const weekData = await getWeekData(year, week);
  if (!weekData) {
    return null;
  }

  return {
    start: new Date(weekData.start_date),
    end: new Date(weekData.end_date)
  };
};

/**
 * Format week period as "DD/MM to DD/MM"
 */
export const formatWeekPeriod = async (year: number, week: number): Promise<string> => {
  const boundaries = await getWeekBoundaries(year, week);
  if (!boundaries) {
    return `Week ${week}, ${year}`;
  }

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  return `${formatDate(boundaries.start)} to ${formatDate(boundaries.end)}`;
};

/**
 * Get the maximum week number for a given year
 */
export const getMaxWeekNumber = async (year: number): Promise<number> => {
  const { data, error } = await supabase
    .from('weeks')
    .select('week_number')
    .eq('year', year)
    .order('week_number', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Error fetching max week number:', error);
    return 52; // Fallback to 52 weeks
  }

  return data.week_number;
};

/**
 * Validate if a week number is valid for a given year
 */
export const isValidWeek = async (year: number, week: number): Promise<boolean> => {
  const maxWeek = await getMaxWeekNumber(year);
  return week >= 1 && week <= maxWeek;
};

/**
 * Synchronous version for backwards compatibility (uses current date.getWeek() logic as fallback)
 */
export const getCurrentWeekNumberSync = (date: Date = new Date()): number => {
  // Simple fallback using getWeek from date-fns for immediate use
  // This should be replaced by the async version where possible
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
};

/**
 * Format week period synchronously as fallback
 */
export const formatWeekPeriodSync = (year: number, week: number): string => {
  // Simple fallback formatting
  return `Week ${week}, ${year}`;
};
