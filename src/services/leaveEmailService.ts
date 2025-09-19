
import { supabase } from '@/integrations/supabase/client';
import { LeaveRequest } from '@/types/leave';

interface LeaveEmailParams {
  fullName: string;
  recipientEmail?: string;
  startDate: string;
  endDate: string;
  isApproved: boolean;
  submittedBy: string;
}

export const sendLeaveEmail = async (leave: LeaveRequest, isApproved: boolean): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    console.log(`Sending ${isApproved ? 'approval' : 'rejection'} email for leave ID: ${leave.id}`);
    
    // Prepare the email data
    const emailData: LeaveEmailParams = {
      fullName: leave.full_name || 'User',
      startDate: leave.start_date,
      endDate: leave.end_date,
      isApproved: isApproved,
      submittedBy: leave.submitter_full_name || leave.full_name || 'Unknown'
    };
    
    // Call the edge function to send the email
    const { data, error } = await supabase.functions.invoke('send-leave-email', {
      body: emailData,
    });
    
    if (error) {
      console.error('Error calling edge function:', error);
      return {
        success: false,
        error: `Failed to send email: ${error.message}`,
      };
    }
    
    console.log('Email function response:', data);
    
    // Check if there was an error in the response
    if (data && !data.success) {
      return {
        success: false,
        error: data.error || "An error occurred while sending the email",
      };
    }
    
    return { 
      success: true,
      message: data?.message || `Leave ${isApproved ? 'approval' : 'rejection'} email sent successfully`
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred while sending the email',
    };
  }
};
