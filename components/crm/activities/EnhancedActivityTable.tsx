
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from '@/hooks/useActivitiesData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { CleanFragment } from '@/components/ui/clean-fragment';
import { ActivityTableHeader } from './table/ActivityTableHeader';
import { ActivityTableRow } from './table/ActivityTableRow';
import { ActivityTableExpandedRow } from './table/ActivityTableExpandedRow';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';

interface EnhancedActivityTableProps {
  activities: Activity[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  onDelete?: () => void;
}

export const EnhancedActivityTable: React.FC<EnhancedActivityTableProps> = ({
  activities,
  sortField,
  sortDirection,
  onSort,
  onDelete
}) => {
  const navigate = useNavigate();
  const { navigateWithContext } = useNavigationHistory();
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const handleToggleExpansion = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const handleActivityClick = (activityId: string) => {
    navigateWithContext(`/crm/activity/${activityId}`, {
      fromLabel: 'Back to Activities'
    });
  };

  const handleDelete = (activityId: string) => {
    // Remove from expanded set if it was expanded
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      newSet.delete(activityId);
      return newSet;
    });
    // Call the parent's delete handler to refresh data
    if (onDelete) onDelete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities ({activities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No activities found</h3>
            <p className="text-muted-foreground">
              Adjust your filters or create a new activity to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full">
              <ActivityTableHeader 
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
              <TableBody className="divide-y divide-border/50">
                {activities.map((activity, index) => (
                  <CleanFragment fragmentKey={`fragment-${activity.id}`}>
                    <ActivityTableRow
                      key={`row-${activity.id}`}
                      activity={activity}
                      isExpanded={expandedActivities.has(activity.id)}
                      onToggleExpansion={handleToggleExpansion}
                      onDelete={handleDelete}
                    />
                    {expandedActivities.has(activity.id) && (
                      <ActivityTableExpandedRow 
                        key={`expanded-${activity.id}`}
                        activity={activity} 
                      />
                    )}
                  </CleanFragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
