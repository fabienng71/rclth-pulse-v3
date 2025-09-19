
import { supabase } from '@/integrations/supabase/client';
import { ReturnFormValues } from '@/hooks/returnFormSchema';
import { createLegacyReturnRequest } from './returnRequestMigrationAdapter';

// @deprecated This service is deprecated. Use enhancedReturnRequestService instead.
console.warn('⚠️ DEPRECATED: returnRequestService is deprecated. Use enhancedReturnRequestService for multi-item support.');

/**
 * Fetches a single return request by ID with additional related data
 */
export const fetchReturnRequest = async (id: string) => {
  // Get the return request data with customer search_name
  const { data, error } = await supabase
    .from('return_requests')
    .select(`
      *,
      customers:customer_code (
        customer_name,
        search_name
      )
    `)
    .eq('id', id)
    .is('deleted', false)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Return request not found');
  }

  // Get the creator's profile separately if we have created_by value
  let creatorProfile = null;
  if (data.created_by) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', data.created_by)
      .maybeSingle();
      
    if (!profileError && profileData) {
      creatorProfile = profileData;
    }
  }

  // Return the combined data with enhanced structure
  return {
    ...data,
    profiles: creatorProfile
  } as {
    id: string;
    customer_code: string;
    return_date: string;
    priority: string;
    notes: string;
    status: string;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    deleted: boolean;
    customers: {
      customer_name: string;
      search_name: string | null;
    } | null;
    profiles: {
      full_name: string;
    } | null;
  };
};

/**
 * Creates a new return request
 * @deprecated Use createEnhancedReturnRequest instead for multi-item support
 */
export const createReturnRequest = async (data: ReturnFormValues, status: string, userId: string | undefined) => {
  console.warn('⚠️ DEPRECATED: createReturnRequest is deprecated. Use createEnhancedReturnRequest for multi-item support.');
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Use the migration adapter to convert to enhanced format
  const result = await createLegacyReturnRequest(data, userId);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create return request');
  }
  
  return { success: true };
};

/**
 * Updates an existing return request
 */
export const updateReturnRequest = async (id: string, data: ReturnFormValues, status: string) => {
  const { error } = await supabase
    .from('return_requests')
    .update({
      customer_code: data.customerCode,
      product_code: data.productCode,
      return_quantity: data.returnQuantity,
      return_date: data.returnDate.toISOString(),
      reason: data.reason,
      comment: data.comment || null,
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .is('deleted', false);

  if (error) {
    throw error;
  }
  
  return { success: true };
};

/**
 * Sends an email with return request details
 */
export const sendReturnRequestEmail = async (id: string) => {
  try {
    console.log(`Preparing to send email for return request ID: ${id}`);
    
    // Fetch the return request with enhanced data structure
    const returnRequest = await fetchReturnRequest(id);
    console.log(`Return request data fetched successfully for ID: ${id}`);
    
    // Call the edge function to send the email
    console.log('Invoking send-return-email edge function...');
    const { data, error } = await supabase.functions.invoke('send-return-email', {
      body: { returnRequest },
    });
    
    if (error) {
      console.error('Error calling edge function:', error);
      return {
        success: false,
        error: `Failed to send email: ${error.message}`,
      };
    }
    
    console.log('Email function response:', data);
    
    // Handle specific error case for domain verification
    if (data && !data.success && data.error === "Domain verification error") {
      return {
        success: false,
        error: data.message || "Domain verification error. Please verify your domain in Resend.",
        details: data.details,
        isDomainError: true
      };
    }
    
    // Check if there was an error returned in the data object
    if (data && !data.success) {
      return {
        success: false,
        error: data.error || "An error occurred while sending the email",
        details: data.details || data.errorDetails
      };
    }
    
    return { 
      success: true, 
      ...data,
      message: data?.message || 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred while sending the email',
    };
  }
};
