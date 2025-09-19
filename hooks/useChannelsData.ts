
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Channel {
  customer_type_code: string;
  channel_name: string;
}

export const useChannelsData = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['channelsData'],
    queryFn: async () => {
      console.log('Fetching channels data...');
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('channel_name', { ascending: true });
        
      if (error) {
        console.error('Error fetching channels data:', error);
        throw new Error('Failed to fetch channels data');
      }

      console.log(`Retrieved ${data?.length || 0} channels from database`);      
      return (data as Channel[]) || [];
    }
  });
  
  return {
    channels: data || [],
    isLoading,
    error
  };
};
