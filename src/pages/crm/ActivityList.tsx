
import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { EnhancedActivityTable } from '@/components/crm/activities/EnhancedActivityTable';
import { useAuthStore } from '@/stores/authStore';
import { useActivitiesData } from '@/hooks/useActivitiesData';
import { ActivityStats } from './components/ActivityStats';
import { ActivityListFilters } from './components/ActivityListFilters';
import { usePersistedActivityState } from './hooks/usePersistedActivityState';
import { useQueryClient } from '@tanstack/react-query';

const ActivityList: React.FC = () => {
  const { toast } = useToast();
  const { isAdmin, profile } = useAuthStore();
  const queryClient = useQueryClient();

  // Simplified data fetching - let backend handle basic authorization
  const { activities, loading, error } = useActivitiesData({
    searchMode: true // This ensures we get all activities for admin users
  });

  // Use the persisted activity list state hook instead of the regular one
  const {
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
  } = usePersistedActivityState(activities || []);

  // Map the stats to match ActivityStats component expectations
  const mappedStats = {
    totalActivities: activityStats.total,
    completedActivities: activityStats.completed,
    pendingActivities: activityStats.overdue,
    upcomingActivities: activityStats.thisWeek,
  };

  // Handle activity deletion with proper refresh
  const handleActivityDeleted = async () => {
    // Invalidate activities queries to refresh the list
    await queryClient.invalidateQueries({ queryKey: ['activities'] });
    await queryClient.invalidateQueries({ queryKey: ['followups'] });
  };

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Activities
            </h1>
            <p className="text-muted-foreground">
              Manage and track your customer relationship activities.
            </p>
          </div>
          <Link to="/crm/activity/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Activity
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <ActivityStats {...mappedStats} />
        
        {/* Simplified Filters */}
        <ActivityListFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          salespersonFilter={salespersonFilter}
          onSalespersonChange={setSalespersonFilter}
          salespersonOptions={salespersonOptions}
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
          completionFilter={completionFilter}
          onCompletionFilterChange={setCompletionFilter}
          onClearFilters={handleClearFilters}
        />
        
        {/* Activities Table */}
        <EnhancedActivityTable
          activities={filteredAndSortedActivities}
          sortField={sortBy}
          sortDirection={sortOrder}
          onSort={handleSort}
          onDelete={handleActivityDeleted}
        />
      </div>
    </div>
  );
};

export default ActivityList;
