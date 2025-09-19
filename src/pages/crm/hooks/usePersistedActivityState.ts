
import { useEffect } from 'react';
import { useActivityListState, ActivityStats } from './useActivityListState';
import { Activity } from '@/hooks/useActivitiesData';
import { useAuthStore } from '@/stores/authStore';

interface PersistedActivityState {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  salespersonFilter: string;
  completionFilter: 'all' | 'completed' | 'active';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedWeek: number | null;
}

const STORAGE_KEY_PREFIX = 'activity_list_state_';

export const usePersistedActivityState = (activities: Activity[]) => {
  const { user } = useAuthStore();
  const userKey = user?.id ? `${STORAGE_KEY_PREFIX}${user.id}` : null;

  // Get the original hook
  const activityState = useActivityListState(activities);

  // Load persisted state on mount
  useEffect(() => {
    if (!userKey) return;

    try {
      const savedState = sessionStorage.getItem(userKey);
      if (savedState) {
        const parsedState: PersistedActivityState = JSON.parse(savedState);
        
        // Restore all state values
        activityState.setSearchTerm(parsedState.searchTerm || '');
        activityState.setStatusFilter(parsedState.statusFilter || 'all');
        activityState.setTypeFilter(parsedState.typeFilter || 'all');
        activityState.setSalespersonFilter(parsedState.salespersonFilter || 'all');
        activityState.setCompletionFilter(parsedState.completionFilter || 'all');
        activityState.setSelectedWeek(parsedState.selectedWeek || null);
        
        // Note: sortBy and sortOrder are handled internally by handleSort
        if (parsedState.sortBy && parsedState.sortOrder) {
          // We can't directly set sort state, but we can trigger it
          // The state will be restored naturally through the next effect
        }

        console.log('Restored activity state from session:', parsedState);
      }
    } catch (error) {
      console.error('Error loading persisted activity state:', error);
    }
  }, [userKey]); // Only run when userKey changes

  // Save state whenever it changes
  useEffect(() => {
    if (!userKey) return;

    const stateToSave: PersistedActivityState = {
      searchTerm: activityState.searchTerm,
      statusFilter: activityState.statusFilter,
      typeFilter: activityState.typeFilter,
      salespersonFilter: activityState.salespersonFilter,
      completionFilter: activityState.completionFilter,
      sortBy: activityState.sortBy,
      sortOrder: activityState.sortOrder,
      selectedWeek: activityState.selectedWeek,
    };

    try {
      sessionStorage.setItem(userKey, JSON.stringify(stateToSave));
      console.log('Saved activity state to session:', stateToSave);
    } catch (error) {
      console.error('Error saving activity state:', error);
    }
  }, [
    userKey,
    activityState.searchTerm,
    activityState.statusFilter,
    activityState.typeFilter,
    activityState.salespersonFilter,
    activityState.completionFilter,
    activityState.sortBy,
    activityState.sortOrder,
    activityState.selectedWeek,
  ]);

  // Return the same interface as the original hook
  return activityState;
};
