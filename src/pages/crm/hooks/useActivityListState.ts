
import { useState, useMemo, useCallback } from 'react';
import { Activity } from '@/hooks/useActivitiesData';

export interface ActivityStats {
  total: number;
  thisWeek: number;
  overdue: number;
  completed: number;
}

type CompletionFilterType = 'all' | 'completed' | 'active';

export const useActivityListState = (activities: Activity[]) => {
  // Core filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [salespersonFilter, setSalespersonFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilterType>('all');
  
  // Sorting state
  const [sortBy, setSortBy] = useState('activity_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Week selection state (simplified)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Helper function to get sortable value - moved before useMemo
  const getSortableValue = (activity: Activity, field: string): any => {
    const value = activity[field as keyof Activity];
    
    // Handle dates
    if (field === 'activity_date' || field === 'follow_up_date') {
      return value ? new Date(value as string) : new Date(0);
    }
    
    // Handle strings
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    
    // Handle null/undefined
    return value ?? '';
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Compute unique salesperson options
  const salespersonOptions = useMemo(() => {
    const salespersons = activities
      .map(activity => activity.salesperson_name)
      .filter((name): name is string => !!name);
    return [...new Set(salespersons)].sort();
  }, [activities]);

  // Compute activity stats
  const activityStats: ActivityStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      total: activities.length,
      thisWeek: activities.filter(activity => {
        const activityDate = new Date(activity.activity_date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate >= weekStart && activityDate <= weekEnd;
      }).length,
      overdue: activities.filter(activity => {
        if (activity.is_done) return false;
        if (!activity.follow_up_date) return false;
        const followUpDate = new Date(activity.follow_up_date);
        followUpDate.setHours(0, 0, 0, 0);
        return followUpDate < today;
      }).length,
      completed: activities.filter(activity => activity.is_done || false).length,
    };
  }, [activities]);

  // Simplified filtering and sorting
  const filteredAndSortedActivities = useMemo(() => {
    const filtered = activities.filter(activity => {
      // Search filter - comprehensive search across all relevant fields
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = [
          activity.customer_name,
          activity.search_name,
          activity.lead_name,
          activity.contact_name,
          activity.salesperson_name,
          activity.notes,
          activity.activity_type
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && activity.pipeline_stage !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && activity.activity_type !== typeFilter) {
        return false;
      }

      // Salesperson filter
      if (salespersonFilter !== 'all' && activity.salesperson_name !== salespersonFilter) {
        return false;
      }

      // Completion filter
      if (completionFilter === 'completed' && !activity.is_done) {
        return false;
      }
      if (completionFilter === 'active' && activity.is_done) {
        return false;
      }

      // Week filter (if selected)
      if (selectedWeek !== null) {
        const activityDate = new Date(activity.activity_date);
        const weekNumber = getWeekNumber(activityDate);
        if (weekNumber !== selectedWeek) {
          return false;
        }
      }

      return true;
    });

    // Simplified sorting
    filtered.sort((a, b) => {
      const aValue = getSortableValue(a, sortBy);
      const bValue = getSortableValue(b, sortBy);
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [activities, searchTerm, statusFilter, typeFilter, salespersonFilter, completionFilter, selectedWeek, sortBy, sortOrder, getSortableValue, getWeekNumber]);

  // Simplified sort handler
  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Simplified clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSalespersonFilter('all');
    setCompletionFilter('all');
    setSelectedWeek(null);
  }, []);

  return {
    // State
    searchTerm,
    statusFilter,
    typeFilter,
    salespersonFilter,
    sortBy,
    sortOrder,
    selectedWeek,
    completionFilter,
    
    // Computed values
    activityStats,
    filteredAndSortedActivities,
    salespersonOptions,
    
    // Handlers
    setSearchTerm,
    setStatusFilter,
    setTypeFilter,
    setSalespersonFilter,
    setSelectedWeek,
    setCompletionFilter,
    handleSort,
    handleClearFilters,
  };
};
