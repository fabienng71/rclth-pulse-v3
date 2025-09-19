
import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerActivities } from './activities/useCustomerActivities';
import { ActivityTableRow } from './activities/ActivityTableRow';
import { ActivityExpandedDetails } from './activities/ActivityExpandedDetails';
import { CleanFragment } from '@/components/ui/clean-fragment';

interface CustomerActivitiesListProps {
  customerCode: string;
}

export const CustomerActivitiesList: React.FC<CustomerActivitiesListProps> = ({ customerCode }) => {
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const { data: activities, isLoading } = useCustomerActivities(customerCode);

  const toggleActivity = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4 text-muted-foreground">
            No activities found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activities ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <CleanFragment fragmentKey={activity.id}>
                <ActivityTableRow
                  activity={activity}
                  isExpanded={expandedActivities.has(activity.id)}
                  onToggle={toggleActivity}
                />
                {expandedActivities.has(activity.id) && (
                  <ActivityExpandedDetails activity={activity} />
                )}
              </CleanFragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
