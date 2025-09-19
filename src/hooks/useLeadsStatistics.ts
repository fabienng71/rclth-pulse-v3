
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeadsStatistics {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  recentlyAdded: number;
}

export function useLeadsStatistics() {
  const { toast } = useToast();

  const { data: statistics, isLoading, error, refetch } = useQuery({
    queryKey: ['leads-statistics'],
    queryFn: async (): Promise<LeadsStatistics> => {
      console.log('Fetching leads statistics...');
      
      // Get total leads count
      const { count: totalLeads, error: countError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      if (countError) throw countError;

      // Get active leads count (status != 'Not Qualified')
      const { count: activeLeads, error: activeError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
        .neq('status', 'Not Qualified');

      if (activeError) throw activeError;

      // Get converted leads (status = 'Won')
      const { count: convertedLeads, error: convertedError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Won');

      if (convertedError) throw convertedError;

      // Get recently added leads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentlyAdded, error: recentError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      return {
        totalLeads: totalLeads || 0,
        activeLeads: activeLeads || 0,
        convertedLeads: convertedLeads || 0,
        recentlyAdded: recentlyAdded || 0
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle errors
  if (error) {
    console.error('Error fetching leads statistics:', error);
    toast({
      title: "Error",
      description: "Failed to load leads statistics. Please try again.",
      variant: "destructive",
    });
  }

  return { 
    statistics: statistics || {
      totalLeads: 0,
      activeLeads: 0,
      convertedLeads: 0,
      recentlyAdded: 0
    }, 
    loading: isLoading,
    error,
    refetch
  };
}
