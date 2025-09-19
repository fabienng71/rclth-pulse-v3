
import React, { useState, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityFormFields } from './ActivityFormFields';
import { FollowUpsSection } from './FollowUpsSection';
import { ActivityFormData } from './formSchema';
import { LeadIntelligencePanel } from '@/components/smart-crm/LeadIntelligencePanel';
import { useLeadIntelligence, useScoringBreakdown } from '@/hooks/useSmartCRM';
import { Activity } from '@/types/activity';
import { ActivityFormDataEnhanced } from '@/types/smartCRM';

interface ActivityFormContentProps {
  form: UseFormReturn<ActivityFormData>;
  isEditMode: boolean;
  onSubmit: (data: ActivityFormData | ActivityFormDataEnhanced) => void;
  isSubmitting: boolean;
  onEntityTypeChange: (entityType: 'customer' | 'lead') => void;
  currentActivityId?: string;
}

export const ActivityFormContent: React.FC<ActivityFormContentProps> = ({
  form,
  isEditMode,
  onSubmit,
  isSubmitting,
  onEntityTypeChange,
  currentActivityId,
}) => {
  // Smart CRM state
  const [shouldCreateLead, setShouldCreateLead] = useState(false);
  const [leadTitle, setLeadTitle] = useState('');

  // Watch only specific fields needed for Smart CRM scoring (performance optimization)
  const watchedFields = form.watch(['activity_type', 'pipeline_stage', 'notes', 'customer_code', 'customer_name']);
  const [activityType, pipelineStage, notes, customerCode, customerName] = watchedFields;

  // DEBUG: Track form renders (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 ActivityFormContent render', {
      isEditMode,
      isSubmitting,
      currentActivityId,
      watchedFieldsChanged: {
        activityType,
        pipelineStage,
        customerCode,
        customerName,
        hasNotes: !!notes
      }
    });
  }
  
  // Memoize activity scoring object to prevent unnecessary re-calculations
  const activityForScoring: Partial<Activity> = useMemo(() => ({
    activity_type: activityType,
    pipeline_stage: pipelineStage, 
    notes: notes,
    customer_code: customerCode,
    customer_name: customerName,
  }), [activityType, pipelineStage, notes, customerCode, customerName]);

  // PERFORMANCE OPTIMIZATION: Re-enable Smart CRM hooks after ActivityFormFields optimization
  const { score, scoringResult, isCalculating } = useLeadIntelligence(activityForScoring);
  const scoringBreakdown = useScoringBreakdown(scoringResult);

  // Re-enable Smart CRM useEffect for automatic lead suggestions
  useEffect(() => {
    if (scoringResult?.recommendations.shouldCreateLead && !leadTitle) {
      setLeadTitle(scoringResult.recommendations.leadTitle);
      setShouldCreateLead(true);
    }
  }, [scoringResult, leadTitle]);

  // Enhanced submit handler that includes lead creation flag
  const handleSubmit = (data: ActivityFormData) => {
    console.log('🎯 ActivityFormContent: Enhanced submit with Smart CRM data:', {
      originalData: data,
      shouldCreateLead,
      leadTitle,
      score,
      isEditMode
    });
    
    if (shouldCreateLead && leadTitle) {
      // Create enhanced data for Smart CRM (works in both create and edit modes)
      const enhancedData: ActivityFormDataEnhanced = {
        ...data,
        // Add Smart CRM fields
        create_lead: shouldCreateLead,
        lead_title: leadTitle,
        lead_score: score,
      };
      
      console.log('🎯 Submitting enhanced data for lead creation:', enhancedData);
      onSubmit(enhancedData);
    } else {
      console.log('🎯 Submitting standard data (no lead creation requested)');
      onSubmit(data);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Entity Selection Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Entity Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFormFields 
                control={form.control}
                watch={form.watch}
                setValue={form.setValue}
                section="entity"
              />
            </CardContent>
          </Card>

          {/* Activity Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFormFields 
                control={form.control}
                watch={form.watch}
                setValue={form.setValue}
                section="details"
              />
            </CardContent>
          </Card>

          {/* Linking & References Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linking & References</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFormFields 
                control={form.control}
                watch={form.watch}
                setValue={form.setValue}
                section="linking"
                currentActivityId={currentActivityId}
              />
            </CardContent>
          </Card>

          {/* Assignment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFormFields 
                control={form.control}
                watch={form.watch}
                setValue={form.setValue}
                section="assignment"
              />
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFormFields 
                control={form.control}
                watch={form.watch}
                setValue={form.setValue}
                section="notes"
              />
            </CardContent>
          </Card>

          {/* Smart CRM Lead Intelligence Panel - Re-enabled after performance optimization */}
          {score > 0 && (
            <LeadIntelligencePanel
              score={score}
              shouldCreate={shouldCreateLead}
              leadTitle={leadTitle}
              onToggleCreate={setShouldCreateLead}
              onTitleChange={setLeadTitle}
              isLoading={isCalculating}
              scoringBreakdown={scoringBreakdown}
              isEditMode={isEditMode}
            />
          )}
          
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Activity' : 'Create Activity'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Follow-Ups Section - Only show if activity exists (edit mode) */}
      {isEditMode && currentActivityId && (
        <>
          <Separator />
          <FollowUpsSection activityId={currentActivityId} />
        </>
      )}
    </div>
  );
};
