import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { LeadCenter } from '@/types/leadCenter';
import { Contact } from '@/types/contact';
import { Customer } from '@/hooks/useCustomersData';
import { leadCenterSchema, LeadCenterFormData } from './leadCenterSchema';

// Customer channel lookup function
const getCustomerChannel = async (customerCode: string): Promise<string | null> => {
  if (!customerCode) return null;
  
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('customer_type_code')
      .eq('customer_code', customerCode)
      .single();
    
    if (error) {
      console.warn('Error fetching customer channel:', error);
      return null;
    }
    
    return customer?.customer_type_code || null;
  } catch (error) {
    console.warn('Error in customer channel lookup:', error);
    return null;
  }
};

export const useLeadCenterForm = (leadId?: string, leadData?: LeadCenter) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!leadId;

  const form = useForm<LeadCenterFormData>({
    resolver: zodResolver(leadCenterSchema),
    defaultValues: {
      lead_title: '',
      lead_description: '',
      status: 'contacted',
      lead_source: '',
      priority: 'Medium',
      assigned_to: '',
      customer_id: '',
      contact_id: '',
      estimated_value: undefined,
      close_probability: undefined,
      next_step: '',
      next_step_due: '',
      customer_channel: '',
    }
  });

  // Load existing lead data for edit mode
  useEffect(() => {
    if (leadData && isEditMode) {
      Object.keys(leadData).forEach((key) => {
        const value = leadData[key as keyof LeadCenter];
        if (value !== null && value !== undefined) {
          form.setValue(key as keyof LeadCenterFormData, value as any);
        }
      });
    }
  }, [leadData, isEditMode, form]);

  const handleCustomerChange = async (customer: Customer | null) => {
    if (customer) {
      form.setValue('customer_id', customer.id);
      
      // Auto-populate customer channel if available
      const channel = await getCustomerChannel(customer.customer_code);
      if (channel) {
        form.setValue('customer_channel', channel);
      }
    } else {
      form.setValue('customer_id', '');
      form.setValue('customer_channel', '');
    }
    
    // Reset contact when customer changes
    form.setValue('contact_id', '');
  };

  const handleContactChange = (contact: Contact | null) => {
    if (contact) {
      form.setValue('contact_id', contact.id);
    } else {
      form.setValue('contact_id', '');
    }
  };

  const onSubmit = async (data: LeadCenterFormData) => {
    try {
      setIsSubmitting(true);
      console.log('Form data:', data);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Clean up data: convert empty strings to null for UUID fields
      const cleanData = {
        ...data,
        assigned_to: data.assigned_to && data.assigned_to.trim() !== '' ? data.assigned_to : null,
        customer_id: data.customer_id && data.customer_id.trim() !== '' ? data.customer_id : null,
        contact_id: data.contact_id && data.contact_id.trim() !== '' ? data.contact_id : null,
        estimated_value: data.estimated_value || null,
        close_probability: data.close_probability || null,
        lead_source: data.lead_source && data.lead_source.trim() !== '' ? data.lead_source : null,
        lead_description: data.lead_description && data.lead_description.trim() !== '' ? data.lead_description : null,
        next_step: data.next_step && data.next_step.trim() !== '' ? data.next_step : null,
        next_step_due: data.next_step_due && data.next_step_due.trim() !== '' ? data.next_step_due : null,
        customer_channel: data.customer_channel && data.customer_channel.trim() !== '' ? data.customer_channel : null,
      };

      console.log('Cleaned data:', cleanData);

      if (isEditMode && leadId) {
        const { error } = await supabase
          .from('lead_center')
          .update(cleanData)
          .eq('id', leadId);

        if (error) {
          console.error('Update error details:', error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Lead updated successfully",
        });
      } else {
        const payload = {
          ...cleanData,
          created_by: user.id,
        };

        console.log('Insert payload:', payload);

        const { error, data: insertData } = await supabase
          .from('lead_center')
          .insert([payload])
          .select();

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }

        console.log('Insert success:', insertData);

        toast({
          title: "Success",
          description: "Lead created successfully",
        });
      }

      navigate('/lead-center');
    } catch (error: any) {
      console.error('Error saving lead:', error);
      
      let errorMessage = 'Failed to save lead';
      if (error.message?.includes('violates foreign key constraint')) {
        if (error.message.includes('customer_id')) {
          errorMessage = 'Invalid customer selected. Please select a valid customer.';
        } else if (error.message.includes('contact_id')) {
          errorMessage = 'Invalid contact selected. Please select a valid contact.';
        } else if (error.message.includes('assigned_to')) {
          errorMessage = 'Invalid user assigned. Please select a valid user.';
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    isEditMode,
    handleCustomerChange,
    handleContactChange,
    onSubmit
  };
};