import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createSampleRequest, SampleRequestFormData } from '@/services/sample-requests';
import { useAuthStore } from '@/stores/authStore';
import { useItemsManagement } from './sample/useItemsManagement';
import { useCustomerSelection } from './sample/useCustomerSelection';
import { useSampleFormValidation } from './sample/useSampleFormValidation';
import { useEmailNotification } from './sample/useEmailNotification';

export const useSampleRequestForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userFullName, profile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  
  const { 
    customerCode, 
    customerName, 
    selectCustomer, 
    setSelectedCustomerByCode,
    clearCustomer
  } = useCustomerSelection();
  
  const {
    items,
    addItem,
    selectItem,
    addEmptyItem,
    removeItem,
    updateItemField
  } = useItemsManagement();
  
  const { validateForm } = useSampleFormValidation();
  const { sendEmailNotification } = useEmailNotification();
  
  console.log('useSampleRequestForm - Customer data:', { customerCode, customerName });
  
  const formData: SampleRequestFormData = {
    customerCode,
    customerName,
    followUpDate,
    notes,
    items,
    createdByName: userFullName || 'Unknown User',
    salespersonCode: profile?.spp_code || undefined
  };
  
  const updateField = <K extends keyof SampleRequestFormData>(
    field: K, 
    value: SampleRequestFormData[K]
  ) => {
    switch (field) {
      case 'followUpDate':
        setFollowUpDate(value as Date | undefined);
        break;
      case 'notes':
        setNotes(value as string);
        break;
      case 'customerCode':
        console.log('Setting customerCode via updateField:', value);
        setSelectedCustomerByCode(value as string);
        break;
      case 'customerName':
        console.log('Setting customerName directly is not supported');
        break;
      // Other fields are handled by their respective hooks
    }
  };
  
  const submitForm = async (submittedFormData?: SampleRequestFormData) => {
    const dataToSubmit = submittedFormData || formData;
    
    console.log('useSampleRequestForm - submitForm called with data:', dataToSubmit);
    
    if (!validateForm(dataToSubmit)) {
      console.log('Validation failed');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await createSampleRequest(
        {
          ...dataToSubmit,
          salespersonCode: user?.profile?.spp_code,
        },
        user?.id
      );
      
      toast({
        title: "Success",
        description: "Sample request submitted successfully",
      });
      
      if (result.id) {
        await sendEmailNotification(result.id);
      }
      
      navigate('/forms/sample');
      
    } catch (error) {
      console.error('Error submitting sample request:', error);
      toast({
        title: "Error",
        description: "Failed to submit sample request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData,
    isSubmitting,
    updateField,
    addItem,
    removeItem,
    updateItemField,
    submitForm,
    validateForm: () => validateForm(formData),
    setSelectedCustomer: setSelectedCustomerByCode,
    selectItem,
    selectCustomer,
    clearCustomer,
    addEmptyItem
  };
};
