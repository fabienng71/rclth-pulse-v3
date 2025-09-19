import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadCenter } from '@/types/leadCenter';
import {
  BasicInfoSection,
  CustomerContactSection,
  LeadDetailsSection,
  NextStepsSection,
  useLeadCenterForm
} from './lead-center-form';

interface LeadCenterFormProps {
  leadId?: string;
  leadData?: LeadCenter;
}

const LeadCenterForm: React.FC<LeadCenterFormProps> = ({ leadId, leadData }) => {
  const {
    form,
    isSubmitting,
    isEditMode,
    handleCustomerChange,
    handleContactChange,
    onSubmit
  } = useLeadCenterForm(leadId, leadData);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Lead' : 'Create New Lead'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoSection form={form} />
            
            <CustomerContactSection 
              form={form}
              handleCustomerChange={handleCustomerChange}
              handleContactChange={handleContactChange}
            />
            
            <LeadDetailsSection form={form} />
            
            <NextStepsSection form={form} />

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Lead' : 'Create Lead')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { LeadCenterForm };
export default LeadCenterForm;