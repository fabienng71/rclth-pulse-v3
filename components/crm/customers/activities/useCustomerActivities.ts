
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CustomerActivity } from './types';

export const useCustomerActivities = (customerCode: string) => {
  return useQuery({
    queryKey: ['customerActivities', customerCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('customer_code', customerCode)
        .order('activity_date', { ascending: false });

      if (error) throw error;
      return data as CustomerActivity[];
    },
    enabled: !!customerCode
  });
};
