import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, FileX } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { WriteoffItemsSection } from '@/components/forms/writeoff/WriteoffItemsSection';
import { WriteoffDetailsSection } from '@/components/forms/writeoff/WriteoffDetailsSection';
import { WriteoffReviewSection } from '@/components/forms/writeoff/WriteoffReviewSection';
import { writeoffFormSchema, WriteoffFormValues } from '@/components/forms/writeoff/schema';
import { WriteoffRequestService } from '@/services/writeoff-requests';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: 'items', title: 'Items', description: 'Add items to write off' },
  { id: 'details', title: 'Details', description: 'Write-off information' },
  { id: 'review', title: 'Review', description: 'Review and submit' },
];

const WriteoffRequestCreate = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExplicitlySubmitted, setHasExplicitlySubmitted] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<WriteoffFormValues>({
    resolver: zodResolver(writeoffFormSchema),
    defaultValues: {
      reason: undefined,
      notes: '',
      items: [],
    },
  });

  const onSubmit = async (values: WriteoffFormValues) => {
    // Only submit if user is on final step and has explicitly clicked submit
    if (currentStep !== steps.length - 1 || !hasExplicitlySubmitted) {
      console.log('Prevented accidental submission. Current step:', currentStep, 'Explicit submit:', hasExplicitlySubmitted);
      return;
    }
    
    console.log('Starting writeoff request submission...', values);
    setIsSubmitting(true);
    try {
      const id = await WriteoffRequestService.createWriteoffRequest(values as any);
      console.log('Writeoff request created successfully with ID:', id);
      
      toast({
        title: "Success",
        description: "Write-off request created successfully",
      });
      
      // Invalidate the writeoff requests cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['writeoff-requests'] });
      
      navigate('/forms/writeoff');
    } catch (error) {
      console.error('Error creating write-off request:', error);
      toast({
        title: "Error",
        description: "Failed to create write-off request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setHasExplicitlySubmitted(false);
    }
  };

  const handleExplicitSubmit = () => {
    console.log('Explicit submit button clicked');
    setHasExplicitlySubmitted(true);
    // The form will submit after this state change
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter key from submitting the form accidentally
    if (e.key === 'Enter' && currentStep !== steps.length - 1) {
      e.preventDefault();
      console.log('Prevented Enter key submission on step:', currentStep);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    console.log('Validating fields for step:', currentStep, fieldsToValidate);
    
    const isValid = await form.trigger(fieldsToValidate);
    console.log('Validation result:', isValid);
    
    if (isValid) {
      console.log('Moving to next step:', currentStep + 1);
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      console.log('Validation failed, staying on current step');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): (keyof WriteoffFormValues)[] => {
    switch (step) {
      case 0:
        return ['items'];
      case 1:
        return ['reason', 'notes'];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WriteoffItemsSection control={form.control} disabled={isSubmitting} />;
      case 1:
        return <WriteoffDetailsSection control={form.control} disabled={isSubmitting} />;
      case 2:
        return <WriteoffReviewSection control={form.control} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-4xl py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/forms')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Forms
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <FileX className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Create Write-off Request</h1>
            <p className="text-muted-foreground">Submit inventory items for write-off</p>
          </div>
        </div>

        {/* Step Indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium ${
                      index === currentStep
                        ? 'border-primary bg-primary text-primary-foreground'
                        : index < currentStep
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 ${
                        index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} onClick={handleExplicitSubmit}>
                  {isSubmitting ? 'Creating...' : 'Create Write-off Request'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default WriteoffRequestCreate;