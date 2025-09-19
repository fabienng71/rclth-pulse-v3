
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SampleRequestFormData, SampleRequestItem } from '@/services/sample-requests';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { SavePdfButton } from './SavePdfButton';

// Import our components
import SimplifiedCustomerSearch from './SimplifiedCustomerSearch';
import DatePickerSection from './DatePickerSection';
import SampleItemsSection from './SampleItemsSection';
import NotesSection from './NotesSection';

interface EnhancedSampleFormProps {
  initialData?: SampleRequestFormData;
  onSubmit: (data: SampleRequestFormData) => Promise<void>;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

const EnhancedSampleForm = ({ initialData, onSubmit, isSubmitting, isEditMode = false }: EnhancedSampleFormProps) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SampleRequestFormData>(() => 
    initialData || {
      customerCode: '',
      customerName: '',
      followUpDate: undefined,
      notes: '',
      items: []
    }
  );
  
  // Sync initialData changes for edit mode only when data actually changes
  useEffect(() => {
    if (initialData && JSON.stringify(initialData) !== JSON.stringify(formData)) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  const updateField = <K extends keyof SampleRequestFormData>(
    field: K, 
    value: SampleRequestFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Consolidated customer handling functions
  const selectCustomer = (customerCode: string, customerName: string) => {
    console.log('EnhancedSampleForm - selectCustomer called with:', { customerCode, customerName });
    setFormData(prev => ({ ...prev, customerCode, customerName }));
  };
  
  const clearCustomer = () => {
    setFormData(prev => ({ ...prev, customerCode: '', customerName: '' }));
  };
  
  const addItem = (newItem: SampleRequestItem) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  const addEmptyItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_code: '', description: '', quantity: 1 }]
    }));
  };
  
  const removeItem = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };
  
  const updateItemField = <K extends keyof SampleRequestItem>(
    index: number, 
    field: K, 
    value: SampleRequestItem[K]
  ) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EnhancedSampleForm - Submitting form with data:', formData);
    await onSubmit(formData);
  };
  
  // Memoized validation to prevent unnecessary re-calculations
  const isFormValid = useMemo(() => {
    return (
      formData.customerCode &&
      formData.customerName &&
      formData.items.length > 0 &&
      formData.items.every(item => item.item_code && item.description && item.quantity)
    );
  }, [formData.customerCode, formData.customerName, formData.items]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl mb-2">Create Sample Request</h1>
        <p className="text-muted-foreground">
          Submit a request for product samples for your customers
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <SimplifiedCustomerSearch 
                  customerCode={formData.customerCode}
                  customerName={formData.customerName}
                  onSelectCustomer={selectCustomer}
                  onClearCustomer={clearCustomer}
                  disabled={isSubmitting}
                />
                
                <DatePickerSection
                  followUpDate={formData.followUpDate}
                  isSubmitting={isSubmitting}
                  onDateChange={(date) => updateField('followUpDate', date)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <SampleItemsSection
                items={formData.items}
                isSubmitting={isSubmitting}
                onAddItem={addItem}
                onAddEmptyItem={addEmptyItem}
                onRemoveItem={removeItem}
                onUpdateItem={updateItemField}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <NotesSection 
                notes={formData.notes || ''}
                isSubmitting={isSubmitting}
                onNotesChange={(notes) => updateField('notes', notes)}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center gap-3 pb-6">
          <div className="flex gap-2">
            {isFormValid && (
              <SavePdfButton
                formData={formData}
                disabled={isSubmitting}
                variant="outline"
                size="default"
              />
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/forms/sample')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                isEditMode ? 'Update Sample Request' : 'Submit Sample Request'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnhancedSampleForm;
