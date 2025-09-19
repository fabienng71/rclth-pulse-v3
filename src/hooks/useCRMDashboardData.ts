
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export interface CRMDashboardMetrics {
  totalActivities: number;
  thisMonthActivities: number;
  activitiesGrowth: number;
  totalLeads: number;
  newLeadsThisMonth: number;
  leadsGrowth: number;
  totalProjects: number;
  activeProjects: number;
  projectsGrowth: number;
  totalContacts: number;
  newContactsThisMonth: number;
  contactsGrowth: number;
  pendingSampleRequests: number;
  followUpsDue: number;
  activitiesByType: Array<{ type: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  projectsByStatus: Array<{ status: string; count: number }>;
  monthlyActivityTrend: Array<{ month: string; count: number }>;
  leadConversionRate: number;
  averageResponseTime: number;
  topPerformers: Array<{ name: string; activities: number; leads: number }>;
}

// Helper function to fetch total contacts count in batches
const fetchTotalContactsCount = async () => {
  let totalCount = 0;
  let hasMore = true;
  let from = 0;
  const batchSize = 800;

  while (hasMore) {
    const { count, data, error } = await supabase
      .from('contacts')
      .select('id', { count: 'exact' })
      .range(from, from + batchSize - 1);
    
    if (error) throw error;
    
    if (data && data.length < batchSize) {
      hasMore = false;
    }
    
    if (count !== null) {
      totalCount = count;
      break; // If count is available, we don't need to continue batching
    }
    
    totalCount += data?.length || 0;
    from += batchSize;
    
    // Safety check to prevent infinite loops
    if (from > 50000) break;
  }

  return totalCount;
};

export const useCRMDashboardData = () => {
  const [metrics, setMetrics] = useState<CRMDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAdmin } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Build base query filters
        const baseActivityFilter = isAdmin ? {} : { salesperson_id: user.id };
        const baseLeadFilter = isAdmin ? {} : { salesperson_code: user.profile?.spp_code };
        const baseProjectFilter = isAdmin ? {} : { salesperson_id: user.id };

        // Fetch activities data
        const [activitiesResult, thisMonthActivitiesResult, lastMonthActivitiesResult] = await Promise.all([
          supabase.from('activities').select('id, activity_type').match(baseActivityFilter),
          supabase.from('activities').select('id').match(baseActivityFilter).gte('created_at', thisMonth.toISOString()),
          supabase.from('activities').select('id').match(baseActivityFilter).gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString())
        ]);

        // Fetch leads data
        const [leadsResult, thisMonthLeadsResult, lastMonthLeadsResult] = await Promise.all([
          supabase.from('leads').select('id, status').match(baseLeadFilter),
          supabase.from('leads').select('id').match(baseLeadFilter).gte('created_at', thisMonth.toISOString()),
          supabase.from('leads').select('id').match(baseLeadFilter).gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString())
        ]);

        // Fetch projects data
        const [projectsResult, thisMonthProjectsResult, lastMonthProjectsResult] = await Promise.all([
          supabase.from('project').select('id, status').match(baseProjectFilter),
          supabase.from('project').select('id').match(baseProjectFilter).gte('created_at', thisMonth.toISOString()),
          supabase.from('project').select('id').match(baseProjectFilter).gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString())
        ]);

        // Fetch contacts data using batch fetching for accurate counts
        const [totalContacts, thisMonthContactsResult, lastMonthContactsResult] = await Promise.all([
          fetchTotalContactsCount(),
          supabase.from('contacts').select('id').gte('created_at', thisMonth.toISOString()),
          supabase.from('contacts').select('id').gte('created_at', lastMonth.toISOString()).lt('created_at', thisMonth.toISOString())
        ]);

        // Fetch sample requests and follow-ups
        const [sampleRequestsResult, followUpsResult] = await Promise.all([
          supabase.from('sample_requests').select('id'),
          supabase.from('activities').select('id').match(baseActivityFilter).lte('follow_up_date', now.toISOString().split('T')[0])
        ]);

        // Calculate growth rates
        const calculateGrowth = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Math.round(((current - previous) / previous) * 100);
        };

        // Process activities by type
        const activitiesByType = activitiesResult.data?.reduce((acc: any[], activity) => {
          const existing = acc.find(item => item.type === activity.activity_type);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ type: activity.activity_type || 'Other', count: 1 });
          }
          return acc;
        }, []) || [];

        // Process leads by status
        const leadsByStatus = leadsResult.data?.reduce((acc: any[], lead) => {
          const existing = acc.find(item => item.status === lead.status);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ status: lead.status || 'Unknown', count: 1 });
          }
          return acc;
        }, []) || [];

        // Process projects by status
        const projectsByStatus = projectsResult.data?.reduce((acc: any[], project) => {
          const existing = acc.find(item => item.status === project.status);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ status: project.status || 'Unknown', count: 1 });
          }
          return acc;
        }, []) || [];

        // Get monthly activity trend (last 6 months)
        const monthlyActivityTrend = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          
          const { data: monthlyActivities } = await supabase
            .from('activities')
            .select('id')
            .match(baseActivityFilter)
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString());

          monthlyActivityTrend.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            count: monthlyActivities?.length || 0
          });
        }

        // Calculate advanced metrics
        const totalLeads = leadsResult.data?.length || 0;
        const closedWonLeads = leadsResult.data?.filter(lead => lead.status === 'closed_won')?.length || 0;
        const leadConversionRate = totalLeads > 0 ? Math.round((closedWonLeads / totalLeads) * 100) : 0;

        // Mock data for advanced metrics (in real implementation, calculate from actual data)
        const averageResponseTime = 2.5; // hours
        const topPerformers = [
          { name: 'John Doe', activities: 45, leads: 12 },
          { name: 'Jane Smith', activities: 38, leads: 10 },
          { name: 'Mike Johnson', activities: 32, leads: 8 }
        ];

        const dashboardMetrics: CRMDashboardMetrics = {
          totalActivities: activitiesResult.data?.length || 0,
          thisMonthActivities: thisMonthActivitiesResult.data?.length || 0,
          activitiesGrowth: calculateGrowth(
            thisMonthActivitiesResult.data?.length || 0,
            lastMonthActivitiesResult.data?.length || 0
          ),
          totalLeads: totalLeads,
          newLeadsThisMonth: thisMonthLeadsResult.data?.length || 0,
          leadsGrowth: calculateGrowth(
            thisMonthLeadsResult.data?.length || 0,
            lastMonthLeadsResult.data?.length || 0
          ),
          totalProjects: projectsResult.data?.length || 0,
          activeProjects: projectsResult.data?.filter(p => p.status === 'active')?.length || 0,
          projectsGrowth: calculateGrowth(
            thisMonthProjectsResult.data?.length || 0,
            lastMonthProjectsResult.data?.length || 0
          ),
          totalContacts: totalContacts,
          newContactsThisMonth: thisMonthContactsResult.data?.length || 0,
          contactsGrowth: calculateGrowth(
            thisMonthContactsResult.data?.length || 0,
            lastMonthContactsResult.data?.length || 0
          ),
          pendingSampleRequests: sampleRequestsResult.data?.length || 0,
          followUpsDue: followUpsResult.data?.length || 0,
          activitiesByType,
          leadsByStatus,
          projectsByStatus,
          monthlyActivityTrend,
          leadConversionRate,
          averageResponseTime,
          topPerformers
        };

        setMetrics(dashboardMetrics);
      } catch (err) {
        console.error('Error fetching CRM dashboard data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isAdmin, toast]);

  return {
    metrics,
    isLoading,
    error
  };
};
