import { supabase } from '@/integrations/supabase/client';
import { CustomerRequestFormValues } from '@/components/forms/customer/schema';
import { useAuthStore } from '@/stores/authStore';
import { createAdminNotification } from '../notificationService';
import { CustomerRequest, ServiceResponse, ServiceResult } from './types';

// Create a new customer request
export const createCustomerRequest = async (
  data: CustomerRequestFormValues, 
  isDraft: boolean = false
): Promise<ServiceResponse<CustomerRequest>> => {
  const { id: userId } = useAuthStore.getState().user || {};
  
  if (!userId) {
    return { data: null, error: new Error('User not authenticated') };
  }

  try {
    const { data: response, error } = await supabase
      .from('customer_requests')
      .insert({
        ...data,
        customer_name: data.customer_name,
        status: isDraft ? 'draft' : 'pending',
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Send notification to admins about the new customer request
    if (response && response.id && !isDraft) {
      await createAdminNotification(
        'customer_request',
        response.id,
        'New Customer Request',
        `A new customer request has been created for ${data.customer_name}`
      );
    }
    
    return { data: response as unknown as CustomerRequest, error: null };
  } catch (error) {
    console.error('Error creating customer request:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

// Fetch all customer requests (removed user filtering to show all requests)
export const fetchUserCustomerRequests = async (): Promise<ServiceResponse<CustomerRequest[]>> => {
  try {
    const { data, error } = await supabase
      .from('customer_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data as unknown as CustomerRequest[], error: null };
  } catch (error) {
    console.error('Error fetching customer requests:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

// Fetch a single customer request by ID
export const fetchCustomerRequestById = async (id: string): Promise<ServiceResponse<CustomerRequest>> => {
  try {
    const { data, error } = await supabase
      .from('customer_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: data as unknown as CustomerRequest, error: null };
  } catch (error) {
    console.error('Error fetching customer request:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

// Update a customer request
export const updateCustomerRequest = async (
  id: string, 
  data: Partial<CustomerRequestFormValues> | { status: string }
): Promise<ServiceResult> => {
  try {
    const { error } = await supabase
      .from('customer_requests')
      .update(data)
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating customer request:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};

// Delete a customer request
export const deleteCustomerRequest = async (id: string): Promise<ServiceResult> => {
  try {
    const { error } = await supabase
      .from('customer_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting customer request:', error);
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};
