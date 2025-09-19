import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import EnhancedClaimVendorSection from './sections/EnhancedClaimVendorSection';
import EnhancedClaimItemsSection from './sections/EnhancedClaimItemsSection';
import EnhancedClaimDetailsSection from './sections/EnhancedClaimDetailsSection';
import EnhancedClaimReviewSection from './sections/EnhancedClaimReviewSection';

export interface ClaimItem {
  item_code: string;
  description: string;
  quantity: number;
  unit_price?: number;
}

export interface ClaimFormData {
  vendor: { vendor_code: string; vendor_name: string } | null;
  items: ClaimItem[];
  reason: string | null;
  note: string;
  value: number | null;
  currency: string;
  status: string;
}

interface EnhancedClaimFormProps {
  onSubmit: (data: ClaimFormData, action: 'draft' | 'email' | 'pdf') => Promise<void>;
  isSubmitting: boolean;
}

type FormStep = 'vendor' | 'items' | 'details' | 'review';

const FORM_STEPS: { key: FormStep; title: string; description: string }[] = [
  { key: 'vendor', title: 'Vendor', description: 'Select vendor information' },
  { key: 'items', title: 'Items', description: 'Add claim items' },
  { key: 'details', title: 'Details', description: 'Claim reason and value' },
  { key: 'review', title: 'Review', description: 'Review and submit' }
];

const EnhancedClaimForm = ({ onSubmit, isSubmitting }: EnhancedClaimFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<FormStep>('vendor');
  const [formData, setFormData] = useState<ClaimFormData>({
    vendor: null,
    items: [],
    reason: null,
    note: '',
    value: null,
    currency: 'THB', // Ensure this matches a valid currency from the database constraint
    status: 'draft'
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    setHasUnsavedChanges(true);
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && formData.vendor) {
        localStorage.setItem('claim-draft', JSON.stringify(formData));
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
  
  const updateField = <K extends keyof ClaimFormData>(
    field: K, 
    value: ClaimFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };
  
  const getCurrentStepIndex = () => FORM_STEPS.findIndex(step => step.key === currentStep);
  const getProgress = () => ((getCurrentStepIndex() + 1) / FORM_STEPS.length) * 100;
  
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'vendor':
        return !!formData.vendor;
      case 'items':
        return formData.items.length > 0 && 
               formData.items.every(item => item.item_code && item.description && item.quantity);
      case 'details':
        return !!(formData.reason && formData.value && formData.currency);
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
  
  const handleSubmit = async (action: 'draft' | 'email' | 'pdf') => {
    await onSubmit(formData, action);
    localStorage.removeItem('claim-draft');
  };
  
  const saveDraft = () => {
    localStorage.setItem('claim-draft', JSON.stringify(formData));
    setHasUnsavedChanges(false);
    toast({
      title: "Draft saved",
      description: "Your progress has been saved",
    });
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'vendor':
        return (
          <EnhancedClaimVendorSection
            vendor={formData.vendor}
            onSelectVendor={(vendor) => updateField('vendor', vendor)}
            onClearVendor={() => updateField('vendor', null)}
          />
        );
      case 'items':
        return (
          <EnhancedClaimItemsSection
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
          <EnhancedClaimDetailsSection
            reason={formData.reason}
            note={formData.note}
            value={formData.value}
            currency={formData.currency}
            onReasonChange={(reason) => updateField('reason', reason)}
            onNoteChange={(note) => updateField('note', note)}
            onValueChange={(value) => updateField('value', value)}
            onCurrencyChange={(currency) => updateField('currency', currency)}
          />
        );
      case 'review':
        return (
          <EnhancedClaimReviewSection
            formData={formData}
            onEdit={(step) => setCurrentStep(step)}
            onSaveDraft={() => handleSubmit('draft')}
            onSendEmail={() => handleSubmit('email')}
            onGeneratePdf={() => handleSubmit('pdf')}
            isSubmitting={isSubmitting}
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
              <CardTitle className="text-2xl">Create Claim</CardTitle>
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
      
      {currentStep !== 'review' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/procurement/claim/create')}
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
            
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || !validateCurrentStep()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedClaimForm;
