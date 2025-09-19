
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, addMonths } from 'date-fns';

export interface MonthlyAdministration {
  year_month: string;
  transportation_amount: number;
  cumulative_amount: number;
}

export interface AdministrationData {
  summary: MonthlyAdministration[];
  isLoading: boolean;
  error: Error | null;
}

export const useAdministrationData = (monthsToFetch = 12) => {
  const [data, setData] = useState<AdministrationData>({
    summary: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching administration data:', { monthsToFetch });
        
        // Calculate dates
        const today = new Date();
        const fromDate = subMonths(today, monthsToFetch + 1);
        const toDate = addMonths(today, 2);
        
        const formattedFromDate = format(fromDate, 'yyyy-MM-dd');
        const formattedToDate = format(toDate, 'yyyy-MM-dd');
        
        console.log('Querying date range:', { formattedFromDate, formattedToDate });

        // Fetch administration data
        const { data: administrationData, error: administrationError } = await supabase.rpc(
          'get_administration_data',
          {
            from_date: formattedFromDate,
            to_date: formattedToDate,
          }
        );

        if (administrationError) throw administrationError;

        // Ensure consistent formatting for year_month
        const formattedAdministrationData = administrationData.map(item => ({
          ...item,
          year_month: item.year_month.trim(),
        }));

        console.log('Fetched administration data:', formattedAdministrationData);

        setData({
          summary: formattedAdministrationData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching administration data:', error);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error occurred'),
        }));
      }
    };

    fetchData();
  }, [monthsToFetch]);

  return data;
};
