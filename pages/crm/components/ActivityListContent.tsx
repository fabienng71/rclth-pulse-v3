
import { ActivityTable } from '@/components/crm/activities/ActivityTable';
import { ActivityCalendarView } from '@/components/crm/activities/ActivityCalendarView';
import { Activity } from '@/hooks/useActivitiesData';

interface ActivityListContentProps {
  loading: boolean;
  currentView: 'list' | 'calendar';
  sortedActivities: Activity[];
  filteredActivities: Activity[];
  onActivityClick: (id: string) => void;
  onDelete: () => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const ActivityListContent = ({
  loading,
  currentView,
  sortedActivities,
  filteredActivities,
  onActivityClick,
  onDelete,
  sortField,
  sortDirection,
  onSort
}: ActivityListContentProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-2xl mb-2">📅</div>
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  return currentView === 'list' ? (
    <ActivityTable 
      activities={sortedActivities}
      onActivityClick={onActivityClick}
      onDelete={onDelete}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
    />
  ) : (
    <ActivityCalendarView 
      activities={filteredActivities}
      loading={loading}
      onActivityClick={onActivityClick}
    />
  );
};
