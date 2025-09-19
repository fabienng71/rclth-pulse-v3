
import { X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerInfoForm } from './CustomerInfoForm';
import { QuotationDetailsForm } from './QuotationDetailsForm';
import { QuotationItemsSection } from './QuotationItemsSection';
import { useQuotationForm } from '@/hooks/useQuotationForm';
import { QuotationWithItems } from '@/types/quotations';
import { getDefaultLogo } from '@/utils/logoStorage';
import { supabase } from '@/integrations/supabase/client';
import { EntityTypeSelector } from '@/components/crm/activity-form/EntityTypeSelector';
import { LeadField } from '@/components/crm/LeadField';

interface QuotationFormProps {
  existingQuotation?: QuotationWithItems;
  isEdit?: boolean;
}

export const QuotationForm = ({ existingQuotation, isEdit = false }: QuotationFormProps) => {
  const navigate = useNavigate();
  const [defaultLogo, setDefaultLogo] = useState<string | null>(null);
  const { 
    form, 
    items, 
    setItems, 
    handleCustomerChange, 
    onSubmit 
  } = useQuotationForm(existingQuotation, isEdit);
  
  // Load the default logo when the component mounts
  useEffect(() => {
    const savedLogo = getDefaultLogo();
    if (savedLogo) {
      setDefaultLogo(savedLogo);
    }
  }, []);

  // State to track if the form is for a lead or customer
  const [isLead, setIsLead] = useState(existingQuotation?.is_lead || false);

  // Handle entity type change
  const handleEntityTypeChange = (isLead: boolean) => {
    setIsLead(isLead);
    
    // Reset form values based on selection
    if (isLead) {
      form.setValue('customer_code', '');
      form.setValue('customer_name', '');
      form.setValue('customer_address', '');
    } else {
      form.setValue('lead_id', '');
      form.setValue('lead_name', '');
    }
  };

  // Preview the default logo if available
  const renderLogoPreview = () => {
    if (!defaultLogo) return null;
    
    const logoUrl = supabase.storage.from('documents').getPublicUrl(defaultLogo).data.publicUrl;
    
    return (
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Default Logo:</p>
        <img 
          src={logoUrl}
          alt="Default Logo" 
          className="max-h-16 object-contain" 
        />
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              {renderLogoPreview()}
              <QuotationDetailsForm control={form.control} />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <EntityTypeSelector control={form.control} onEntityTypeChange={handleEntityTypeChange} />
              
              {isLead ? (
                <LeadField control={form.control} />
              ) : (
                <CustomerInfoForm 
                  control={form.control} 
                  onCustomerChange={handleCustomerChange} 
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <QuotationItemsSection 
          items={items} 
          onChange={setItems}
          readOnly={false}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/quotations')}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Update' : 'Create'} Quotation
          </Button>
        </div>
      </form>
    </Form>
  );
};
