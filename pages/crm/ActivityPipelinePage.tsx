
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useActivityPipeline } from '@/hooks/useActivityPipeline';
import { ActivityPipelineHeader } from '@/components/crm/activities/pipeline/ActivityPipelineHeader';
import { PipelineSummaryCard } from '@/components/crm/activities/pipeline/PipelineSummaryCard';
import { EmptyPipelineState } from '@/components/crm/activities/pipeline/EmptyPipelineState';
import { ActivityTimeline } from '@/components/crm/activities/pipeline/ActivityTimeline';

const ActivityPipelinePage = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const { activities, loading, error } = useActivityPipeline(activityId);

  const handleBack = () => {
    navigate('/crm/activities');
  };

  const handleViewDetails = (activityId: string) => {
    navigate(`/crm/activity/${activityId}`);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="container py-6">
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-lg text-muted-foreground">Loading pipeline...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="container py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-red-500">
                <p>{error}</p>
                <Button variant="outline" onClick={handleBack} className="mt-4">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const entityInfo = activities[0];
  const entityName = entityInfo?.is_lead ? entityInfo.lead_name : entityInfo?.customer_name;
  const entityType = entityInfo?.is_lead ? 'Lead' : 'Customer';

  return (
    <>
      <Navigation />
      <main className="container py-6">
        <ActivityPipelineHeader
          onBack={handleBack}
          entityType={entityType}
          entityName={entityName}
        />

        {activities.length === 0 ? (
          <EmptyPipelineState />
        ) : (
          <div className="space-y-6">
            <PipelineSummaryCard activities={activities} />
            <ActivityTimeline
              activities={activities}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}
      </main>
    </>
  );
};

export default ActivityPipelinePage;
