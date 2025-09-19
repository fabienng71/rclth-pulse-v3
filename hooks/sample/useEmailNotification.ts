
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEmailNotification = () => {
  const { toast } = useToast();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Send email notification
  const sendEmailNotification = async (sampleRequestId: string) => {
    try {
      setIsSendingEmail(true);
      
      // First fetch the complete sample request with items
      const { data: sampleRequest, error: fetchError } = await supabase
        .from('sample_requests')
        .select(`
          *,
          sample_request_items(*)
        `)
        .eq('id', sampleRequestId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching sample request for email:', fetchError);
        return;
      }
      
      // Send the email using our Edge Function
      const { error } = await supabase.functions.invoke('send-sample-email', {
        body: { sampleRequest }
      });
      
      if (error) {
        console.error('Error sending sample request email:', error);
        toast({
          title: "Warning",
          description: "Sample request was created but email notification failed",
          variant: "default",
        });
      } else {
        console.log('Email notification sent successfully');
      }
    } catch (error) {
      console.error('Error in sendEmailNotification:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  return { sendEmailNotification, isSendingEmail };
};
