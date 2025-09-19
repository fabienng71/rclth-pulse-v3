
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ContactActivity {
  id: string;
  activity_type: string;
  pipeline_stage: string;
  status: string;
  activity_date: string;
  follow_up_date: string | null;
  customer_code: string;
  customer_name: string;
  contact_name: string;
  lead_name: string;
  notes: string;
  salesperson_name: string;
  is_done: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useContactActivities(customerCode: string | null) {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchActivities = async () => {
    if (!customerCode) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('customer_code', customerCode)
        .order('activity_date', { ascending: false });

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [customerCode]);

  return {
    activities,
    loading,
    refetch: fetchActivities
  };
}
