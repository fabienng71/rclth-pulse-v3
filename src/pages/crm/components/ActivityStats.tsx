
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface ActivityStatsProps {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  upcomingActivities: number;
}

export const ActivityStats: React.FC<ActivityStatsProps> = ({
  totalActivities,
  completedActivities,
  pendingActivities,
  upcomingActivities
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Total Activities
          </CardTitle>
          <CardDescription>All activities in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActivities}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Completed
          </CardTitle>
          <CardDescription>Activities with past follow-up dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{completedActivities}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            Pending
          </CardTitle>
          <CardDescription>Activities needing follow-up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">{pendingActivities}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Upcoming
          </CardTitle>
          <CardDescription>Activities with future follow-up dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{upcomingActivities}</div>
        </CardContent>
      </Card>
    </div>
  );
};
