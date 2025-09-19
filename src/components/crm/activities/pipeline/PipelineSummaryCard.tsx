
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityPipeline {
  id: string;
  activity_date: string;
  pipeline_stage?: string;
}

interface PipelineSummaryCardProps {
  activities: ActivityPipeline[];
}

export const PipelineSummaryCard: React.FC<PipelineSummaryCardProps> = ({ activities }) => {
  const calculateDaysInPipeline = () => {
    if (activities.length === 0) return 0;
    const startDate = new Date(activities[0]?.activity_date);
    const endDate = new Date(activities[activities.length - 1]?.activity_date);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{activities.length}</div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {activities[activities.length - 1]?.pipeline_stage || 'Lead'}
            </div>
            <div className="text-sm text-muted-foreground">Current Stage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {calculateDaysInPipeline()}
            </div>
            <div className="text-sm text-muted-foreground">Days in Pipeline</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
