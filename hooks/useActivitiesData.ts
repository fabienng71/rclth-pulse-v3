

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export interface Activity {
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
  sample_items_description?: string | null;
  is_lead: boolean;
  lead_id: string | null;
  lead_name: string | null;
  sample_request_id: string | null;
  project_id: string | null;
  pipeline_stage?: string | null;
  parent_activity_id?: string | null;
  is_done?: boolean;
  completed_at?: string | null;
  // Enhanced linked data
  sample_request?: {
    id: string;
    customer_name: string;
    customer_code: string;
    follow_up_date: string | null;
    notes: string | null;
    created_at: string;
    items?: Array<{
      item_code: string;
      description: string;
      quantity: number;
      is_free: boolean;
      price: number | null;
    }>;
  } | null;
  project?: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    start_date: string;
    end_date: string | null;
    budget: number | null;
    vendor_name: string | null;
    vendor_code: string | null;
    target_value: number | null;
    target_type: string | null;
  } | null;
}

interface UseActivitiesOptions {
  filterDate?: Date;
  filterType?: string;
  fromDate?: Date;
  toDate?: Date;
  salesperson?: string;
  followUpsOnly?: boolean;
  searchMode?: boolean;
  completionFilter?: 'all' | 'completed' | 'active';
}

export const useActivitiesData = (options: UseActivitiesOptions = {}) => {
  const { filterDate, filterType, fromDate, toDate, salesperson, followUpsOnly, searchMode, completionFilter } = options;
  const { user, isAdmin } = useAuthStore();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching activities with options:', { 
          isAdmin, 
          searchMode, 
          filterDate, 
          fromDate, 
          toDate, 
          salesperson,
          completionFilter 
        });

        // First, fetch the basic activities with completion fields
        let query = supabase
          .from('activities')
          .select(`
            *,
            customers:customer_code (
              search_name
            )
          `);

        // Only apply date filters if not in search mode
        if (!searchMode) {
          if (filterDate) {
            const dateStr = filterDate.toISOString().split('T')[0];
            query = query.eq('activity_date', dateStr);
          }

          if (fromDate && toDate) {
            query = query
              .gte('activity_date', fromDate.toISOString().split('T')[0])
              .lte('activity_date', toDate.toISOString().split('T')[0]);
          }
        } else {
          // In search mode, apply date range if provided
          if (fromDate && toDate) {
            query = query
              .gte('activity_date', fromDate.toISOString().split('T')[0])
              .lte('activity_date', toDate.toISOString().split('T')[0]);
          }
        }

        if (filterType && filterType !== 'all') {
          query = query.eq('activity_type', filterType);
        }

        if (salesperson) {
          query = query.eq('salesperson_name', salesperson);
        }

        // Apply completion filter
        if (completionFilter === 'completed') {
          query = query.eq('is_done', true);
        } else if (completionFilter === 'active') {
          query = query.eq('is_done', false);
        }

        if (followUpsOnly) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStr = today.toISOString().split('T')[0];
          
          query = query
            .not('follow_up_date', 'is', null)
            .lte('follow_up_date', todayStr);
        }

        // SIMPLIFIED AUTHORIZATION: Only restrict for non-admin users
        if (!isAdmin && user) {
          console.log('Applying salesperson restriction for non-admin user:', user.id);
          query = query.eq('salesperson_id', user.id);
        } else if (isAdmin) {
          console.log('Admin user - showing all activities');
        }

        const { data: activitiesData, error } = await query.order('activity_date', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        console.log(`Fetched ${activitiesData.length} activities`);

        // Now fetch related data for activities that have linked sample requests or projects
        const activitiesWithLinkedData = await Promise.all(
          activitiesData.map(async (activity) => {
            let sampleRequest = null;
            let project = null;

            // Fetch sample request details if linked
            if (activity.sample_request_id) {
              try {
                const { data: sampleData, error: sampleError } = await supabase
                  .from('sample_requests')
                  .select(`
                    id,
                    customer_name,
                    customer_code,
                    follow_up_date,
                    notes,
                    created_at
                  `)
                  .eq('id', activity.sample_request_id)
                  .maybeSingle();

                if (!sampleError && sampleData) {
                  // Fetch sample request items
                  const { data: itemsData, error: itemsError } = await supabase
                    .from('sample_request_items')
                    .select(`
                      item_code,
                      description,
                      quantity,
                      is_free,
                      price
                    `)
                    .eq('request_id', activity.sample_request_id);

                  sampleRequest = {
                    id: sampleData.id,
                    customer_name: sampleData.customer_name,
                    customer_code: sampleData.customer_code,
                    follow_up_date: sampleData.follow_up_date,
                    notes: sampleData.notes,
                    created_at: sampleData.created_at,
                    items: itemsError ? [] : (itemsData || [])
                  };
                }
              } catch (err) {
                console.warn('Error fetching sample request details:', err);
              }
            }

            // Fetch project details if linked
            if (activity.project_id) {
              try {
                const { data: projectData, error: projectError } = await supabase
                  .from('project')
                  .select(`
                    id,
                    title,
                    description,
                    status,
                    start_date,
                    end_date,
                    budget,
                    vendor_name,
                    vendor_code,
                    target_value,
                    target_type
                  `)
                  .eq('id', activity.project_id)
                  .maybeSingle();

                if (!projectError && projectData) {
                  project = {
                    id: projectData.id,
                    title: projectData.title,
                    description: projectData.description,
                    status: projectData.status,
                    start_date: projectData.start_date,
                    end_date: projectData.end_date,
                    budget: projectData.budget,
                    vendor_name: projectData.vendor_name,
                    vendor_code: projectData.vendor_code,
                    target_value: projectData.target_value,
                    target_type: projectData.target_type
                  };
                }
              } catch (err) {
                console.warn('Error fetching project details:', err);
                // Handle 406 errors gracefully - likely RLS policy or authentication issue
                if (err && typeof err === 'object' && 'code' in err && err.code === 'PGRST000') {
                  console.warn('Project access denied - user may not have permission or authentication issue');
                }
              }
            }

            return {
              ...activity,
              search_name: activity.customers?.search_name || activity.customer_name,
              sample_request: sampleRequest,
              project: project
            };
          })
        );

        setActivities(activitiesWithLinkedData);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch activities'));
        toast({
          title: 'Error',
          description: 'Failed to load activities. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user, isAdmin, filterDate, filterType, fromDate, toDate, salesperson, followUpsOnly, searchMode, completionFilter, toast]);

  return {
    activities,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        let query = supabase.from('activities').select(`
          *,
          customers:customer_code (
            search_name
          )
        `);

        if (!searchMode) {
          if (filterDate) {
            const dateStr = filterDate.toISOString().split('T')[0];
            query = query.eq('activity_date', dateStr);
          }

          if (fromDate && toDate) {
            query = query
              .gte('activity_date', fromDate.toISOString().split('T')[0])
              .lte('activity_date', toDate.toISOString().split('T')[0]);
          }
        } else {
          // In search mode, apply date range if provided
          if (fromDate && toDate) {
            query = query
              .gte('activity_date', fromDate.toISOString().split('T')[0])
              .lte('activity_date', toDate.toISOString().split('T')[0]);
          }
        }

        if (filterType && filterType !== 'all') {
          query = query.eq('activity_type', filterType);
        }

        if (salesperson) {
          query = query.eq('salesperson_name', salesperson);
        }

        // Apply completion filter
        if (completionFilter === 'completed') {
          query = query.eq('is_done', true);
        } else if (completionFilter === 'active') {
          query = query.eq('is_done', false);
        }

        // SIMPLIFIED AUTHORIZATION: Only restrict for non-admin users
        if (!isAdmin && user) {
          query = query.eq('salesperson_id', user.id);
        }

        const { data: activitiesData, error } = await query.order('activity_date', { ascending: false });

        if (error) throw new Error(error.message);
        
        // Fetch related data for activities that have linked sample requests or projects
        const activitiesWithLinkedData = await Promise.all(
          activitiesData.map(async (activity) => {
            let sampleRequest = null;
            let project = null;

            // Fetch sample request details if linked
            if (activity.sample_request_id) {
              try {
                const { data: sampleData, error: sampleError } = await supabase
                  .from('sample_requests')
                  .select(`
                    id,
                    customer_name,
                    customer_code,
                    follow_up_date,
                    notes,
                    created_at
                  `)
                  .eq('id', activity.sample_request_id)
                  .maybeSingle();

                if (!sampleError && sampleData) {
                  const { data: itemsData, error: itemsError } = await supabase
                    .from('sample_request_items')
                    .select(`
                      item_code,
                      description,
                      quantity,
                      is_free,
                      price
                    `)
                    .eq('request_id', activity.sample_request_id);

                  sampleRequest = {
                    id: sampleData.id,
                    customer_name: sampleData.customer_name,
                    customer_code: sampleData.customer_code,
                    follow_up_date: sampleData.follow_up_date,
                    notes: sampleData.notes,
                    created_at: sampleData.created_at,
                    items: itemsError ? [] : (itemsData || [])
                  };
                }
              } catch (err) {
                console.warn('Error fetching sample request details:', err);
              }
            }

            // Fetch project details if linked
            if (activity.project_id) {
              try {
                const { data: projectData, error: projectError } = await supabase
                  .from('project')
                  .select(`
                    id,
                    title,
                    description,
                    status,
                    start_date,
                    end_date,
                    budget,
                    vendor_name,
                    vendor_code,
                    target_value,
                    target_type
                  `)
                  .eq('id', activity.project_id)
                  .maybeSingle();

                if (!projectError && projectData) {
                  project = {
                    id: projectData.id,
                    title: projectData.title,
                    description: projectData.description,
                    status: projectData.status,
                    start_date: projectData.start_date,
                    end_date: projectData.end_date,
                    budget: projectData.budget,
                    vendor_name: projectData.vendor_name,
                    vendor_code: projectData.vendor_code,
                    target_value: projectData.target_value,
                    target_type: projectData.target_type
                  };
                }
              } catch (err) {
                console.warn('Error fetching project details:', err);
                // Handle 406 errors gracefully - likely RLS policy or authentication issue
                if (err && typeof err === 'object' && 'code' in err && err.code === 'PGRST000') {
                  console.warn('Project access denied - user may not have permission or authentication issue');
                }
              }
            }

            return {
              ...activity,
              search_name: activity.customers?.search_name || activity.customer_name,
              sample_request: sampleRequest,
              project: project
            };
          })
        );

        setActivities(activitiesWithLinkedData as Activity[]);
      } catch (err) {
        console.error('Error refetching activities:', err);
        toast({
          title: 'Error',
          description: 'Failed to refresh activities. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };
};
