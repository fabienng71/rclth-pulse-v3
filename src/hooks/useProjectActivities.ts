
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export interface ProjectActivity {
  id: string;
  activity_date: string;
  activity_type: string;
  customer_name: string | null;
  customer_code: string | null;
  contact_name: string | null;
  salesperson_name: string | null;
  salesperson_id: string | null;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
  search_name?: string | null;
  is_lead: boolean;
  lead_id: string | null;
  lead_name: string | null;
  project_id: string | null;
}

interface UseProjectActivitiesOptions {
  projectId: string;
  limit?: number;
}

export const useProjectActivities = ({ projectId, limit }: UseProjectActivitiesOptions) => {
  const { user, isAdmin } = useAuthStore();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjectActivities = async () => {
      if (!user || !projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('activities')
          .select(`
            *,
            customers:customer_code (
              search_name
            )
          `)
          .eq('project_id', projectId);

        // Limit to user's activities unless admin
        if (!isAdmin) {
          query = query.eq('salesperson_id', user.id);
        }

        // Apply limit if specified
        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query.order('activity_date', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        // Transform the data to flatten the customers object
        const transformedData = data.map(activity => ({
          ...activity,
          search_name: activity.customers?.search_name || activity.customer_name
        }));

        setActivities(transformedData);
      } catch (err) {
        console.error('Error fetching project activities:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch project activities'));
        toast({
          title: 'Error',
          description: 'Failed to load project activities. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectActivities();
  }, [user, isAdmin, projectId, limit, toast]);

  const refetch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('activities')
        .select('*')
        .eq('project_id', projectId);

      if (!isAdmin && user) {
        query = query.eq('salesperson_id', user.id);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query.order('activity_date', { ascending: false });

      if (error) throw new Error(error.message);
      setActivities(data as ProjectActivity[]);
    } catch (err) {
      console.error('Error refetching project activities:', err);
      toast({
        title: 'Error',
        description: 'Failed to refresh project activities. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loading,
    error,
    refetch
  };
};
