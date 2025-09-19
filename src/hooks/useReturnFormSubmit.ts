
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Customer, useCustomersData } from '@/hooks/useCustomersData';
import { Item, useItemsData } from '@/hooks/useItemsData';
import { useAuthStore } from '@/stores/authStore';
import { createReturnRequest, sendReturnRequestEmail } from '@/services/returnRequestService';
import { returnFormSchema, ReturnFormValues } from './returnFormSchema';
import { supabase } from '@/integrations/supabase/client';

// @deprecated Use Enhanced Return Form instead for multi-item support
console.warn('⚠️ DEPRECATED: useReturnFormSubmit is deprecated. Use EnhancedReturnForm for multi-item support.');

export const useReturnFormSubmit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { customers } = useCustomersData();
  const { items } = useItemsData();

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      customerCode: '',
      productCode: '',
      returnQuantity: 1,
      returnDate: new Date(),
      reason: '',
      comment: '',
      unit: '',
    },
  });

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
      
      const result = await createReturnRequest(data, 'sent', user.id);
      
      const { data: newRequest, error: newRequestError } = await supabase
        .from('return_requests')
        .select('id')
        .eq('customer_code', data.customerCode)
        .eq('product_code', data.productCode)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (newRequestError || !newRequest) {
        console.error('Error retrieving new request ID:', newRequestError);
        toast({
          title: "Return request sent",
          description: "Your return request has been submitted, but email notification could not be sent.",
        });
        setTimeout(() => navigate('/forms'), 1500);
        return;
      }
      
      const requestId = newRequest.id;
      const emailResult = await sendReturnRequestEmail(requestId);
      
      if (emailResult.success) {
        setEmailSent(true);
        toast({
          title: "Return request sent",
          description: `Your return request has been successfully sent and an email notification has been delivered to the team.${emailResult.id ? ` (Email ID: ${emailResult.id})` : ''}`,
        });
        
        setTimeout(() => {
          navigate('/forms');
        }, 1500);
      } else if (emailResult.isDomainError) {
        handleDomainError();
      } else {
        handleEmailError();
      }
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

  const handleDomainError = () => {
    toast({
      title: "Return request sent but email delivery needs attention",
      description: "Your return request has been sent, but the email notification couldn't be delivered because the domain needs to be verified in Resend. The development team has been notified.",
      variant: "default",
    });
    
    setTimeout(() => {
      toast({
        title: "Email domain verification required",
        description: "To enable email notifications, please verify the 'repertoire.co.th' domain in Resend at https://resend.com/domains",
        variant: "default",
      });
    }, 1000);
    
    setTimeout(() => {
      navigate('/forms');
    }, 3000);
  };

  const handleEmailError = () => {
    toast({
      title: "Return request sent",
      description: "Your return request has been sent, but there was an issue sending the email notification. The team has been notified of this issue.",
      variant: "default",
    });
    
    setTimeout(() => {
      navigate('/forms');
    }, 1500);
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
      await createReturnRequest(data, 'draft', user.id);
      
      toast({
        title: "Draft saved",
        description: "Your return request has been saved as a draft",
      });
      
      setTimeout(() => {
        navigate('/forms');
      }, 1500);
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

  const handleCustomerSelect = (customerCode: string) => {
    form.setValue("customerCode", customerCode);
    const customer = customers?.find(c => c.customer_code === customerCode) || null;
    setSelectedCustomer(customer);
  };

  const handleItemSelect = (itemCode: string) => {
    form.setValue("productCode", itemCode);
    const item = items?.find(i => i.item_code === itemCode) || null;
    setSelectedItem(item);
    
    // When an item is selected, update the unit field
    if (item && item.base_unit_code) {
      form.setValue("unit", item.base_unit_code);
    }
  };

  const onReasonChange = (value: string) => {
    form.setValue("reason", value);
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
    emailSent
  };
};
