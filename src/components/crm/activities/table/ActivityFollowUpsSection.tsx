import React from 'react';
import { format } from 'date-fns';
import { Clock, CheckCircle2, AlertCircle, User, Calendar } from 'lucide-react';
import { useActivityFollowUps } from '@/hooks/useActivityFollowUps';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityFollowUpsSectionProps {
  activityId: string;
}

export const ActivityFollowUpsSection: React.FC<ActivityFollowUpsSectionProps> = ({
  activityId,
}) => {
  const { followUps, isLoading, stats, isOverdue } = useActivityFollowUps(activityId);

  if (isLoading) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Follow-ups
        </h4>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Card key={i} className="border-l-4 border-l-transparent">
              <CardContent className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!followUps || followUps.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Follow-ups
        </h4>
        <div className="text-sm text-muted-foreground bg-muted/20 rounded-md p-3 text-center">
          No follow-ups for this activity yet
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'low':
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusBorderColor = (followUp: any) => {
    if (followUp.is_done) {
      return 'border-l-green-500';
    }
    if (isOverdue(followUp)) {
      return 'border-l-red-500';
    }
    return 'border-l-blue-500';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Follow-ups ({followUps.length})
        </h4>
        {stats.total > 0 && (
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="text-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {stats.completed} done
            </Badge>
            {stats.pending > 0 && (
              <Badge variant="outline" className="text-blue-600">
                <Clock className="h-3 w-3 mr-1" />
                {stats.pending} pending
              </Badge>
            )}
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="text-white">
                <AlertCircle className="h-3 w-3 mr-1" />
                {stats.overdue} overdue
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {followUps.map((followUp) => (
          <Card
            key={followUp.id}
            className={`border-l-4 transition-all duration-200 ${getStatusBorderColor(followUp)} ${
              followUp.is_done ? 'bg-muted/20' : 'bg-background'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getPriorityColor(followUp.priority)}
                    className="text-xs flex items-center gap-1"
                  >
                    {getPriorityIcon(followUp.priority)}
                    {followUp.priority}
                  </Badge>
                  {followUp.is_done && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                  {!followUp.is_done && isOverdue(followUp) && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(followUp.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-sm">
                  {followUp.follow_up_note}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {format(new Date(followUp.follow_up_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {followUp.created_by && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Created by user {followUp.created_by.slice(-4)}</span>
                      </div>
                    )}
                  </div>
                  {followUp.assigned_to && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Assigned to user {followUp.assigned_to.slice(-4)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};