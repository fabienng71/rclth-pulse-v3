import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { updateReturnRequest } from '@/services/returnRequestService';
import { useReturnEmailHandler } from './return/useReturnEmailHandler';
import { useReturnFormState } from './return/useReturnFormState';
import { useReturnFormLoader } from './return/useReturnFormLoader';
import { ReturnFormValues } from './returnFormSchema';

export const useReturnFormEdit = (id: string) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { emailSent, handleEmailNotification } = useReturnEmailHandler();
  const { isLoading, returnRequestCreator, loadReturnRequest } = useReturnFormLoader(id);
  const [dataLoaded, setDataLoaded] = useState(false);
  const {
    form,
    selectedCustomer,
    selectedItem,
    isSubmitting,
    setIsSubmitting,
    isSavingDraft,
    setIsSavingDraft,
    handleCustomerSelect,
    handleItemSelect,
    onReasonChange,
    setSelectedCustomer,
    setSelectedItem
  } = useReturnFormState();

  useEffect(() => {
    const loadFormData = async () => {
      try {
        if (dataLoaded) return; // Prevent duplicate loading
        
        const returnRequest = await loadReturnRequest();
        
        if (returnRequest) {
          // Set form values
          form.setValue('customerCode', returnRequest.customerCode);
          form.setValue('productCode', returnRequest.productCode);
          form.setValue('returnQuantity', returnRequest.returnQuantity);
          form.setValue('returnDate', returnRequest.returnDate);
          form.setValue('reason', returnRequest.reason);
          form.setValue('comment', returnRequest.comment || '');

          // Find and set selected customer if available
          if (returnRequest.customerCode) {
            // Let's use a basic customer object with just the required fields from the form data
            setSelectedCustomer({
              customer_code: returnRequest.customerCode,
              customer_name: returnRequest.customerName || '',
              search_name: returnRequest.customerSearchName || null
            });
          }

          // Find and set selected item if available
          if (returnRequest.productCode) {
            setSelectedItem({
              item_code: returnRequest.productCode,
              description: returnRequest.productDescription || '',
              unit_price: null,
              base_unit_code: null,
              posting_group: null,
              vendor_code: null,
              brand: null,
              attribut_1: null
            });
          }
          
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error loading return request:', error);
        toast({
          title: "Error",
          description: "Failed to load return request details",
          variant: "destructive",
        });
      }
    };

    if (id && !dataLoaded) {
      loadFormData();
    }
  }, [id, form, loadReturnRequest, setSelectedCustomer, setSelectedItem, toast, dataLoaded]);

  const onSubmit = async (data: ReturnFormValues) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to submit a return request",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      
      await updateReturnRequest(id, data, 'sent');
      await handleEmailNotification(id);
    } catch (err) {
      console.error('Error in form submission:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending the return request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to save a draft",
          variant: "destructive",
        });
        return;
      }

      setIsSavingDraft(true);
      
      const data = form.getValues();
      await updateReturnRequest(id, data, 'draft');
      
      toast({
        title: "Draft saved",
        description: "Your return request has been saved as a draft",
      });
    } catch (err) {
      console.error('Error saving draft:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving draft",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  return {
    form,
    onSubmit,
    saveDraft,
    selectedCustomer,
    selectedItem,
    handleCustomerSelect,
    handleItemSelect,
    onReasonChange,
    isSubmitting,
    isSavingDraft,
    isLoading,
    emailSent,
    returnRequestCreator
  };
};
