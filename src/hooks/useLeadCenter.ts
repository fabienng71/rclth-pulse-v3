import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { LeadCenter, LeadCenterFilters, LeadCenterStats, FoodIngredientsSalesStage } from '@/types/leadCenter';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export const useLeadCenter = (filters?: LeadCenterFilters, pagination?: PaginationOptions) => {
  const [leads, setLeads] = useState<LeadCenter[]>([]);
  const [stats, setStats] = useState<LeadCenterStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 50;

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('lead_center')
        .select(`
          *,
          contact:contacts (
            id,
            first_name,
            last_name,
            email
          ),
          customer:customers (
            customer_code,
            customer_name
          )
        `, { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(from, to);

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.assigned_to?.length) {
        query = query.in('assigned_to', filters.assigned_to);
      }
      if (filters?.lead_source) {
        query = query.ilike('lead_source', `%${filters.lead_source}%`);
      }
      if (filters?.next_step_due_from) {
        query = query.gte('next_step_due', filters.next_step_due_from);
      }
      if (filters?.next_step_due_to) {
        query = query.lte('next_step_due', filters.next_step_due_to);
      }
      if (filters?.search) {
        query = query.or(`
          lead_title.ilike.%${filters.search}%,
          lead_description.ilike.%${filters.search}%,
          next_step.ilike.%${filters.search}%
        `);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transform the joined data to match our LeadCenter interface
      const transformedLeads: LeadCenter[] = (data || []).map((item: any) => ({
        ...item,
        // Ensure we have the right structure for joined data
        contact: item.contact ? {
          id: item.contact.id,
          contact_name: `${item.contact.first_name || ''} ${item.contact.last_name || ''}`.trim(),
          email: item.contact.email,
          first_name: item.contact.first_name,
          last_name: item.contact.last_name
        } : undefined,
        customer: item.customer ? {
          customer_code: item.customer.customer_code,
          customer_name: item.customer.customer_name
        } : undefined
      }));
      
      setLeads(transformedLeads);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('lead_center')
        .select('status, estimated_value, close_probability, lead_source, priority, next_step_due, created_at, updated_at');

      if (error) throw error;

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Define status constants for consistency
      const CLOSED_WON: FoodIngredientsSalesStage = 'closed_won';
      const CLOSED_LOST: FoodIngredientsSalesStage = 'closed_lost';
      
      // Calculate overdue follow-ups
      const overdueFollowups = data.filter(l => 
        l.next_step_due && new Date(l.next_step_due) < now
      ).length;

      // Calculate this week's conversions
      const thisWeekConversions = data.filter(l => 
        l.status === CLOSED_WON && new Date(l.updated_at) >= oneWeekAgo
      ).length;

      // Calculate average days to close for won leads
      const wonLeads = data.filter(l => l.status === CLOSED_WON);
      const avgDaysToClose = wonLeads.length > 0 
        ? wonLeads.reduce((sum, l) => {
            const created = new Date(l.created_at);
            const closed = new Date(l.updated_at);
            const days = Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / wonLeads.length
        : 0;

      // Calculate high value leads (>$50,000)
      const highValueLeads = data.filter(l => 
        (l.estimated_value || 0) > 50000
      ).length;

      // Calculate active leads (all except closed)
      const activeLeads = data.filter(l => 
        l.status !== CLOSED_WON && l.status !== CLOSED_LOST
      ).length;

      // Calculate conversion rate
      const conversionRate = data.length > 0 
        ? (data.filter(l => l.status === CLOSED_WON).length / data.length) * 100
        : 0;

      // Calculate lead sources distribution
      const leadSources = data.reduce((acc: Record<string, number>, l) => {
        const source = l.lead_source || 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      // Calculate priority distribution
      const priorityDistribution = data.reduce((acc: Record<string, number>, l) => {
        acc[l.priority] = (acc[l.priority] || 0) + 1;
        return acc;
      }, {});

      // Calculate monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        
        const monthLeads = data.filter(l => {
          const created = new Date(l.created_at);
          return created >= monthDate && created < nextMonth;
        });

        const monthConversions = monthLeads.filter(l => l.status === CLOSED_WON).length;
        const monthValue = monthLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

        monthlyTrend.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          leads: monthLeads.length,
          conversions: monthConversions,
          value: monthValue,
        });
      }

      // Define status groups using the actual enum
      const openStatuses: FoodIngredientsSalesStage[] = ['contacted'];
      const inProgressStatuses: FoodIngredientsSalesStage[] = ['meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating'];
      const closedWonStatuses: FoodIngredientsSalesStage[] = ['closed_won'];
      const closedLostStatuses: FoodIngredientsSalesStage[] = ['closed_lost'];

      // Filter leads by status with validation
      const validData = data.filter(l => l.status); // Ensure status exists
      
      const stats: LeadCenterStats = {
        total: validData.length,
        open: validData.filter((l) => openStatuses.includes(l.status as FoodIngredientsSalesStage)).length,
        in_progress: validData.filter((l) => inProgressStatuses.includes(l.status as FoodIngredientsSalesStage)).length,
        won: validData.filter((l) => closedWonStatuses.includes(l.status as FoodIngredientsSalesStage)).length,
        lost: validData.filter((l) => closedLostStatuses.includes(l.status as FoodIngredientsSalesStage)).length,
        total_value: validData.reduce((sum: number, l) => sum + (l.estimated_value || 0), 0),
        avg_probability: validData.length > 0 
          ? validData.reduce((sum: number, l) => sum + (l.close_probability || 0), 0) / validData.length 
          : 0,
        // Enhanced metrics
        overdue_followups: overdueFollowups,
        this_week_conversions: thisWeekConversions,
        avg_days_to_close: Math.round(avgDaysToClose),
        high_value_leads: highValueLeads,
        active_leads: activeLeads,
        conversion_rate: conversionRate,
        lead_sources: leadSources,
        priority_distribution: priorityDistribution,
        monthly_trend: monthlyTrend,
      };

      setStats(stats);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [filters, page, limit]);

  const updateLeadStatus = async (id: string, status: LeadCenter['status']) => {
    try {
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }
      
      const payload = { status, updated_at: new Date().toISOString() };
      
      // Validate status before sending to database
      const validStatuses = ['contacted', 'meeting_scheduled', 'samples_sent', 'samples_followed_up', 'negotiating', 'closed_won', 'closed_lost'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status value: "${status}". Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const { data, error } = await supabase
        .from('lead_center')
        .update(payload)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }
      
      // Update local state
      setLeads(prev => 
        prev.map(lead => 
          lead.id === id ? { ...lead, status, updated_at: new Date().toISOString() } : lead
        )
      );

      // Refresh stats
      fetchStats();

      toast({
        title: "Success",
        description: `Lead status updated to ${status}`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to update lead status: ${err.message}`,
        variant: "destructive",
      });
      
      // Re-throw the error so KanbanBoard can handle it
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lead_center')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== id));
      fetchStats();

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  return {
    leads,
    stats,
    isLoading,
    error,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPreviousPage: page > 1,
    refetch: fetchLeads,
    updateLeadStatus,
    deleteLead,
  };
};