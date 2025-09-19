
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { useActivityForm } from '@/components/crm/activity-form/useActivityForm';
import { ActivityFormContent } from '@/components/crm/activity-form/ActivityFormContent';
import { ActivityFormLoading } from '@/components/crm/activity-form/ActivityFormLoading';

const ActivityForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  console.log('=== ActivityForm PAGE RENDER ===');
  console.log('Activity ID from params:', id);
  console.log('Is edit mode:', isEditMode);

  const {
    form,
    isLoading,
    error,
    isSubmitting,
    onSubmit,
    handleEntityTypeChange,
  } = useActivityForm(id);

  console.log('Hook values:', {
    isLoading,
    error,
    isSubmitting,
    formState: form.formState
  });

  if (isLoading) {
    console.log('Showing loading state');
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <ActivityFormLoading />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/crm/activities')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {isEditMode ? 'Edit Activity' : 'New Activity'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Update activity details' : 'Create a new activity'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <ActivityFormContent
          form={form}
          isEditMode={isEditMode}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onEntityTypeChange={handleEntityTypeChange}
          currentActivityId={id} // Pass current activity ID to prevent self-reference
        />
      </div>
    </>
  );
};

export default ActivityForm;
