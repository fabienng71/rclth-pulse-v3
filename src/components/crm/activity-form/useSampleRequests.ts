
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define a simpler type for sample requests that doesn't require the items array
export interface SimpleSampleRequest {
  id: string;
  customer_code: string;
  customer_name: string;
  search_name?: string;
  salesperson_code?: string;
  created_by_name?: string;
  follow_up_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useSampleRequests = () => {
  const [sampleRequests, setSampleRequests] = useState<SimpleSampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSampleRequests = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('sample_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setSampleRequests(data || []);
      } catch (err) {
        console.error('Error fetching sample requests:', err);
        setError(err instanceof Error ? err : new Error('Failed to load sample requests'));
        toast({
          title: 'Error',
          description: 'Failed to load sample requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSampleRequests();
  }, [toast]);

  return { sampleRequests, loading, error };
};
