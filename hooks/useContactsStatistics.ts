
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ContactsStatistics {
  totalContacts: number;
  activeContacts: number;
  highValueContacts: number;
  recentlyAdded: number;
}

export function useContactsStatistics() {
  const { toast } = useToast();

  const { data: statistics, isLoading, error, refetch } = useQuery({
    queryKey: ['contacts-statistics'],
    queryFn: async (): Promise<ContactsStatistics> => {
      console.log('Fetching contact statistics...');
      
      // Get total contacts count
      const { count: totalContacts, error: countError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get active contacts count (status = 'active')
      const { count: activeContacts, error: activeError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get high value contacts (health_score >= 80)
      const { count: highValueContacts, error: highValueError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .gte('health_score', 80);

      if (highValueError) throw highValueError;

      // Get recently added contacts (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentlyAdded, error: recentError } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      return {
        totalContacts: totalContacts || 0,
        activeContacts: activeContacts || 0,
        highValueContacts: highValueContacts || 0,
        recentlyAdded: recentlyAdded || 0
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle errors
  if (error) {
    console.error('Error fetching contact statistics:', error);
    toast({
      title: "Error",
      description: "Failed to load contact statistics. Please try again.",
      variant: "destructive",
    });
  }

  return { 
    statistics: statistics || {
      totalContacts: 0,
      activeContacts: 0,
      highValueContacts: 0,
      recentlyAdded: 0
    }, 
    loading: isLoading,
    error,
    refetch
  };
}
