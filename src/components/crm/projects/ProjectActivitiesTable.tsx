
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody } from '@/components/ui/table';
import { Plus, RefreshCw } from 'lucide-react';
import { Activity } from '@/hooks/useActivitiesData';
import { ActivityTableHeader } from '@/components/crm/activities/table/ActivityTableHeader';
import { ActivityTableRow } from '@/components/crm/activities/table/ActivityTableRow';
import { ActivityTableExpandedRow } from '@/components/crm/activities/table/ActivityTableExpandedRow';
import { CleanFragment } from '@/components/ui/clean-fragment';

interface ProjectActivitiesTableProps {
  activities: Activity[];
  loading: boolean;
  projectId: string;
  onRefresh: () => void;
}

export const ProjectActivitiesTable: React.FC<ProjectActivitiesTableProps> = ({
  activities,
  loading,
  projectId,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  const handleCreateActivity = () => {
    navigate('/crm/activity/new', {
      state: {
        prefilledData: {
          project_id: projectId,
          entity_type: 'project'
        }
      }
    });
  };

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

  const handleDelete = (activityId: string) => {
    // Remove from expanded set if it was expanded
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      newSet.delete(activityId);
      return newSet;
    });
    // Refresh the activities list
    onRefresh();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Project Activities ({activities.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={handleCreateActivity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No activities yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first activity for this project
            </p>
            <Button onClick={handleCreateActivity}>
              <Plus className="h-4 w-4 mr-2" />
              Create Activity
            </Button>
          </div>
        ) : (
          <Table>
            <ActivityTableHeader />
            <TableBody>
              {activities.map((activity) => (
                <CleanFragment fragmentKey={activity.id}>
                  <ActivityTableRow
                    activity={activity}
                    isExpanded={expandedActivities.has(activity.id)}
                    onToggleExpansion={handleToggleExpansion}
                    onDelete={handleDelete}
                  />
                  {expandedActivities.has(activity.id) && (
                    <ActivityTableExpandedRow activity={activity} />
                  )}
                </CleanFragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
