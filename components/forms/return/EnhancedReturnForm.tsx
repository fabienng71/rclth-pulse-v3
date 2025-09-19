
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import EnhancedReturnCustomerSection from './sections/EnhancedReturnCustomerSection';
import EnhancedReturnItemsSection from './sections/EnhancedReturnItemsSection';
import EnhancedReturnDetailsSection from './sections/EnhancedReturnDetailsSection';
import EnhancedReturnReviewSection from './sections/EnhancedReturnReviewSection';

export interface ReturnRequestItem {
  item_code: string;
  description: string;
  quantity: number;
  unit?: string;
  reason: string;
}

export interface ReturnRequestFormData {
  customerCode: string;
  customerName: string;
  returnDate: Date;
  items: ReturnRequestItem[];
  notes?: string;
  priority: 'low' | 'medium' | 'high';
}

interface EnhancedReturnFormProps {
  onSubmit: (data: ReturnRequestFormData) => Promise<void>;
  isSubmitting: boolean;
}

type FormStep = 'customer' | 'items' | 'details' | 'review';

const FORM_STEPS: { key: FormStep; title: string; description: string }[] = [
  { key: 'customer', title: 'Customer', description: 'Select customer information' },
  { key: 'items', title: 'Items', description: 'Add return items' },
  { key: 'details', title: 'Details', description: 'Return date and notes' },
  { key: 'review', title: 'Review', description: 'Review and submit' }
];

const EnhancedReturnForm = ({ onSubmit, isSubmitting }: EnhancedReturnFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<FormStep>('customer');
  const [formData, setFormData] = useState<ReturnRequestFormData>({
    customerCode: '',
    customerName: '',
    returnDate: new Date(),
    items: [],
    notes: '',
    priority: 'medium'
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    setHasUnsavedChanges(true);
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && formData.customerCode) {
        localStorage.setItem('return-request-draft', JSON.stringify(formData));
        setHasUnsavedChanges(false);
        toast({
          title: "Draft saved",
          description: "Your progress has been automatically saved",
          duration: 2000
        });
      }
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [formData, hasUnsavedChanges]);
  
  const updateField = <K extends keyof ReturnRequestFormData>(
    field: K, 
    value: ReturnRequestFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };
  
  const getCurrentStepIndex = () => FORM_STEPS.findIndex(step => step.key === currentStep);
  const getProgress = () => ((getCurrentStepIndex() + 1) / FORM_STEPS.length) * 100;
  
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'customer':
        return !!(formData.customerCode && formData.customerName);
      case 'items':
        return formData.items.length > 0 && 
               formData.items.every(item => item.item_code && item.description && item.quantity && item.reason);
      case 'details':
        return !!formData.returnDate;
      case 'review':
        return true;
      default:
        return false;
    }
  };
  
  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Incomplete step",
        description: "Please complete all required fields before proceeding",
        variant: "destructive"
      });
      return;
    }
    
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < FORM_STEPS.length - 1) {
      setCurrentStep(FORM_STEPS[currentIndex + 1].key);
    }
  };
  
  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(FORM_STEPS[currentIndex - 1].key);
    }
  };
  
  const handleSubmit = async () => {
    await onSubmit(formData);
    localStorage.removeItem('return-request-draft');
  };
  
  const saveDraft = () => {
    localStorage.setItem('return-request-draft', JSON.stringify(formData));
    setHasUnsavedChanges(false);
    toast({
      title: "Draft saved",
      description: "Your progress has been saved",
    });
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'customer':
        return (
          <EnhancedReturnCustomerSection
            customerCode={formData.customerCode}
            customerName={formData.customerName}
            onSelectCustomer={(code, name) => {
              updateField('customerCode', code);
              updateField('customerName', name);
            }}
            onClearCustomer={() => {
              updateField('customerCode', '');
              updateField('customerName', '');
            }}
          />
        );
      case 'items':
        return (
          <EnhancedReturnItemsSection
            items={formData.items}
            onAddItem={(item) => updateField('items', [...formData.items, item])}
            onUpdateItem={(index, field, value) => {
              const newItems = [...formData.items];
              newItems[index] = { ...newItems[index], [field]: value };
              updateField('items', newItems);
            }}
            onRemoveItem={(index) => {
              const newItems = [...formData.items];
              newItems.splice(index, 1);
              updateField('items', newItems);
            }}
          />
        );
      case 'details':
        return (
          <EnhancedReturnDetailsSection
            returnDate={formData.returnDate}
            notes={formData.notes || ''}
            priority={formData.priority}
            onDateChange={(date) => updateField('returnDate', date)}
            onNotesChange={(notes) => updateField('notes', notes)}
            onPriorityChange={(priority) => updateField('priority', priority)}
          />
        );
      case 'review':
        return (
          <EnhancedReturnReviewSection
            formData={formData}
            onEdit={(step) => setCurrentStep(step)}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Create Return Request</CardTitle>
              <p className="text-muted-foreground mt-1">
                {FORM_STEPS.find(step => step.key === currentStep)?.description}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Step {getCurrentStepIndex() + 1} of {FORM_STEPS.length}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <Progress value={getProgress()} className="h-2" />
            
            <div className="flex items-center space-x-4">
              {FORM_STEPS.map((step, index) => (
                <div
                  key={step.key}
                  className={cn(
                    "flex items-center space-x-2 cursor-pointer transition-colors",
                    currentStep === step.key 
                      ? "text-primary" 
                      : index < getCurrentStepIndex() 
                      ? "text-green-600" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => {
                    if (index <= getCurrentStepIndex()) {
                      setCurrentStep(step.key);
                    }
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                    currentStep === step.key 
                      ? "border-primary bg-primary text-primary-foreground"
                      : index < getCurrentStepIndex()
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-muted bg-background"
                  )}>
                    {index < getCurrentStepIndex() ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="font-medium hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/forms/return')}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            onClick={saveDraft}
            disabled={isSubmitting}
            className="text-muted-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {getCurrentStepIndex() > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep !== 'review' ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || !validateCurrentStep()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Return Request'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedReturnForm;
