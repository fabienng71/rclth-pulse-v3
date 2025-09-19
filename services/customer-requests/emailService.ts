
import { supabase } from '@/integrations/supabase/client';

// Send email notification for a customer request
export const sendCustomerRequestEmail = async (
  customerRequestId: string, 
  recipientEmail: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // Fetch the customer request data first
    const { data: requestData, error: fetchError } = await supabase
      .from('customer_requests')
      .select('*')
      .eq('id', customerRequestId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Call the edge function to send the email
    const { error } = await supabase.functions.invoke('send-customer-request-email', {
      body: { 
        customerRequest: requestData,
        recipientEmail
      }
    });

    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending customer request email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Failed to send email notification')
    };
  }
};
