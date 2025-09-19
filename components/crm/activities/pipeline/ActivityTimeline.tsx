
import React from 'react';
import { ActivityTimelineItem } from './ActivityTimelineItem';

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
}

interface ActivityTimelineProps {
  activities: ActivityPipeline[];
  onViewDetails: (activityId: string) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  onViewDetails
}) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
      
      <div className="space-y-6">
        {activities.map((activity, index) => (
          <ActivityTimelineItem
            key={activity.id}
            activity={activity}
            index={index}
            totalActivities={activities.length}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};
