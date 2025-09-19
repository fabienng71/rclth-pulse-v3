
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PublicHoliday {
  id: string | number;
  holiday_date: string;
  description: string;
  created_at?: string; // Make this optional since it might not always be returned
}

export function usePublicHolidays() {
  const [holidays, setHolidays] = useState<PublicHoliday[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setIsLoading(true);
        
        // Get current year
        const currentYear = new Date().getFullYear();
        
        // Fetch holidays for current year
        const { data, error } = await supabase
          .from('public_holidays')
          .select('*')
          .gte('holiday_date', `${currentYear}-01-01`)
          .lte('holiday_date', `${currentYear}-12-31`)
          .order('holiday_date', { ascending: true });
        
        if (error) throw error;
        
        setHolidays(data as PublicHoliday[]);
      } catch (err) {
        console.error('Error fetching public holidays:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch public holidays'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  return { holidays, isLoading, error };
}
