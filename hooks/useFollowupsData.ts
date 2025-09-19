
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/stores/authStore';

interface UseFollowupsOptions {
  statusFilter?: string;
  priorityFilter?: string;
  salespersonFilter?: string;
  searchTerm?: string;
  fromDate?: Date;
  toDate?: Date;
}

interface Followup {
  id: string;
  customer_name: string;
  follow_up_date: string;
  notes: string;
  pipeline_stage: string;
  priority: string;
  salesperson_name: string;
  is_done?: boolean;
  completed_at?: string | null;
}

interface FollowupStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
}

// Helper function to format date as YYYY-MM-DD in local timezone
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useFollowupsData = (options: UseFollowupsOptions = {}) => {
  const { user, isAdmin } = useAuthStore();
  const debouncedSearchTerm = useDebounce(options.searchTerm || '', 300);

  const { data: followups = [], isLoading, error } = useQuery({
    queryKey: ['followups', { ...options, searchTerm: debouncedSearchTerm }],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      console.log('Fetching followups with options:', { 
        isAdmin, 
        ...options, 
        searchTerm: debouncedSearchTerm 
      });
      
      // Query activities table directly - follow-ups are just activities with follow_up_date set
      let query = supabase
        .from('activities')
        .select('*')
        .not('follow_up_date', 'is', null);

      // Status filter - case insensitive (using pipeline_stage)
      if (options.statusFilter && options.statusFilter !== 'all') {
        query = query.ilike('pipeline_stage', options.statusFilter);
      }

      // Salesperson filter
      if (options.salespersonFilter && options.salespersonFilter !== 'all') {
        query = query.eq('salesperson_name', options.salespersonFilter);
      }

      // Search filter
      if (debouncedSearchTerm) {
        query = query.or(`customer_name.ilike.%${debouncedSearchTerm}%,notes.ilike.%${debouncedSearchTerm}%,salesperson_name.ilike.%${debouncedSearchTerm}%,lead_name.ilike.%${debouncedSearchTerm}%`);
      }

      // Date range filter
      if (options.fromDate) {
        query = query.gte('follow_up_date', formatLocalDate(options.fromDate));
      }
      if (options.toDate) {
        query = query.lte('follow_up_date', formatLocalDate(options.toDate));
      }

      // Handle simple priority-based date filters
      if (options.priorityFilter && options.priorityFilter !== 'all') {
        const today = new Date();
        const todayFormatted = formatLocalDate(today);
        
        console.log('Today formatted for filtering:', todayFormatted);

        switch (options.priorityFilter) {
          case 'today':
            console.log('Filtering for today:', todayFormatted);
            query = query.eq('follow_up_date', todayFormatted);
            break;
          case 'overdue':
            console.log('Filtering for overdue (before):', todayFormatted);
            query = query.lt('follow_up_date', todayFormatted);
            break;
          // Week filtering is handled by fromDate/toDate from WeekSelector
        }
      }

      // Authorization: Only restrict for non-admin users
      if (!isAdmin && user) {
        console.log('Applying salesperson restriction for non-admin user:', user.id);
        query = query.eq('salesperson_id', user.id);
      } else if (isAdmin) {
        console.log('Admin user - showing all followups');
      }

      const { data, error } = await query.order('follow_up_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching followups:', error);
        throw error;
      }
      
      console.log('Raw followups data:', data);
      
      const mappedData = (data || []).map(activity => ({
        id: activity.id,
        customer_name: activity.customer_name || activity.lead_name || '',
        follow_up_date: activity.follow_up_date,
        notes: activity.notes || '',
        pipeline_stage: activity.pipeline_stage || 'Lead',
        priority: 'medium', // Default priority
        salesperson_name: activity.salesperson_name || '',
        is_done: activity.is_done || false,
        completed_at: activity.completed_at,
      }));
      
      console.log('Mapped followups:', mappedData);
      
      return mappedData;
    },
    enabled: !!user,
  });

  // Fetch salesperson options
  const { data: salespersonOptions = [] } = useQuery({
    queryKey: ['salesperson-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('salesperson_name')
        .not('salesperson_name', 'is', null)
        .not('follow_up_date', 'is', null);

      if (error) throw error;

      const uniqueSalespersons = [...new Set((data || []).map(item => item.salesperson_name))];
      return uniqueSalespersons.filter(name => name && name.trim() !== '');
    },
  });

  // Fetch status options (using pipeline_stage)
  const { data: statusOptions = [] } = useQuery({
    queryKey: ['status-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('pipeline_stage')
        .not('pipeline_stage', 'is', null)
        .not('follow_up_date', 'is', null);

      if (error) throw error;

      const uniqueStatuses = [...new Set((data || []).map(item => item.pipeline_stage))];
      return uniqueStatuses.filter(status => status && status.trim() !== '');
    },
  });

  const stats: FollowupStats = {
    total: followups.length,
    pending: followups.filter(f => !f.is_done && (f.pipeline_stage?.toLowerCase() === 'lead' || f.pipeline_stage?.toLowerCase() === 'qualified')).length,
    completed: followups.filter(f => f.is_done || f.pipeline_stage?.toLowerCase() === 'closed won').length,
    overdue: followups.filter(f => {
      if (f.is_done) return false; // Don't count completed activities as overdue
      const followupDate = new Date(f.follow_up_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      followupDate.setHours(0, 0, 0, 0);
      return followupDate < today && (f.pipeline_stage?.toLowerCase() === 'lead' || f.pipeline_stage?.toLowerCase() === 'qualified');
    }).length,
  };

  return {
    followups,
    salespersonOptions,
    statusOptions,
    isLoading,
    error,
    stats,
  };
};
