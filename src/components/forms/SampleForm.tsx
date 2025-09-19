import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SampleRequestFormData, SampleRequestItem } from '@/services/sampleRequestService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { SavePdfButton } from './sample/SavePdfButton';

// Import our components
import SimplifiedCustomerSearch from './sample/SimplifiedCustomerSearch';
import DatePickerSection from './sample/DatePickerSection';
import SampleItemsSection from './sample/SampleItemsSection';
import NotesSection from './sample/NotesSection';

interface SampleFormProps {
  initialData?: SampleRequestFormData;
  onSubmit: (data: SampleRequestFormData) => Promise<void>;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

const SampleForm = ({ initialData, onSubmit, isSubmitting, isEditMode = false }: SampleFormProps) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<SampleRequestFormData>(
    initialData || {
      customerCode: '',
      customerName: '',
      followUpDate: undefined,
      notes: '',
      items: []
    }
  );
  
  // Effect to sync initialData changes (important for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  const updateField = <K extends keyof SampleRequestFormData>(
    field: K, 
    value: SampleRequestFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // This is the critical function that wasn't working correctly before
  // Now it explicitly updates both code and name fields
  const selectCustomer = (customerCode: string, customerName: string) => {
    console.log('SampleForm - selectCustomer called with:', { customerCode, customerName });
    updateField('customerCode', customerCode);
    updateField('customerName', customerName);
  };
  
  const clearCustomer = () => {
    updateField('customerCode', '');
    updateField('customerName', '');
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
    console.log('SampleForm - Submitting form with data:', formData);
    // Pass the current component state rather than relying on the hook state
    await onSubmit(formData);
  };
  
  const validateForm = () => {
    return (
      formData.customerCode &&
      formData.customerName &&
      formData.items.length > 0 &&
      formData.items.every(item => item.item_code && item.description && item.quantity)
    );
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
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
      
      <div className="flex justify-between items-center gap-2 mb-6">
        <div>
          {validateForm() && (
            <SavePdfButton
              formData={formData}
              disabled={isSubmitting}
              variant="ghost"
              size="sm"
            />
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/forms')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !validateForm()}
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
  );
};

export default SampleForm;
