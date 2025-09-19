
import React from 'react';
import { Calendar, User, Building, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { PipelineStageBadge } from '@/components/crm/activities/PipelineStageBadge';
import DOMPurify from 'dompurify';

interface ActivityFollowUp {
  id: string;
  follow_up_note: string;
  follow_up_date: string;
  priority: 'low' | 'medium' | 'high';
  is_done: boolean;
  created_at: string;
  assigned_to?: string;
  created_by?: string;
}

interface ActivityPipeline {
  id: string;
  activity_date: string;
  activity_type: string;
  customer_name?: string;
  customer_code?: string;
  lead_name?: string;
  lead_id?: string;
  is_lead: boolean;
  contact_name?: string;
  salesperson_name?: string;
  notes?: string;
  follow_up_date?: string;
  pipeline_stage?: string;
  parent_activity_id?: string;
  follow_ups?: ActivityFollowUp[];
}

interface ActivityTimelineItemProps {
  activity: ActivityPipeline;
  index: number;
  totalActivities: number;
  onViewDetails: (activityId: string) => void;
}

export const ActivityTimelineItem: React.FC<ActivityTimelineItemProps> = ({
  activity,
  index,
  totalActivities,
  onViewDetails
}) => {
  // Helper function to safely render HTML content
  const renderSafeHTML = (htmlContent: string) => {
    const cleanHTML = DOMPurify.sanitize(htmlContent);
    return { __html: cleanHTML };
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Helper function to get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'low':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="relative flex items-start gap-6">
      {/* Timeline dot */}
      <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-primary rounded-full border-2 border-background">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
      </div>
      
      {/* Activity card */}
      <Card className="flex-1">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {activity.activity_type}
              </Badge>
              <PipelineStageBadge stage={activity.pipeline_stage || 'Lead'} />
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(activity.activity_date), 'MMM dd, yyyy')}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Step {index + 1} of {totalActivities}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              {activity.is_lead ? <User className="h-4 w-4" /> : <Building className="h-4 w-4" />}
              <span className="font-medium">
                {activity.is_lead ? activity.lead_name : activity.customer_name}
              </span>
            </div>
            {activity.contact_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{activity.contact_name}</span>
              </div>
            )}
          </div>

          {activity.notes && (
            <div className="mb-3">
              <h4 className="font-medium mb-1">Notes:</h4>
              <div 
                className="text-sm text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={renderSafeHTML(activity.notes)}
              />
            </div>
          )}

          {activity.follow_up_date && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <Calendar className="h-3 w-3" />
              <span>Follow-up: {format(new Date(activity.follow_up_date), 'MMM dd, yyyy')}</span>
            </div>
          )}

          {/* Follow-up Notes Section */}
          {activity.follow_ups && activity.follow_ups.length > 0 && (
            <div className="mt-4 border-t pt-3">
              <h4 className="font-medium mb-2 text-sm text-muted-foreground">Follow-up Actions:</h4>
              <div className="space-y-2">
                {activity.follow_ups.map((followUp) => (
                  <div
                    key={followUp.id}
                    className={`p-3 rounded-lg border ${
                      followUp.is_done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(followUp.priority)}`}
                        >
                          {getPriorityIcon(followUp.priority)}
                          <span className="ml-1 capitalize">{followUp.priority}</span>
                        </Badge>
                        {followUp.is_done && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(followUp.follow_up_date), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={renderSafeHTML(followUp.follow_up_note)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              By: {activity.salesperson_name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(activity.id)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
