
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LeaveRequest, LeaveCredits } from '@/types/leave';
import { sendLeaveEmail } from '@/services/leaveEmailService';

export const useLeaveApproval = (
  setApprovedRows: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  setApprovingIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  setLeaveCredits: React.Dispatch<React.SetStateAction<LeaveCredits | null>>,
  onRefresh?: () => void
) => {
  const handleApproveAndUpdateCredits = async (leave: LeaveRequest) => {
    setApprovingIds(prev => ({ ...prev, [leave.id]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('approve-leave', {
        body: { leave_id: leave.id, user_id: leave.user_id },
      });

      if (error) throw error;

      setApprovedRows(prev => ({ ...prev, [leave.id]: true }));

      if (onRefresh) {
        onRefresh();
      }
      
      const emailResponse = await sendLeaveEmail(leave, true);
      if (!emailResponse.success) {
        console.error("Email sending failed:", emailResponse.error);
      }

      toast({
        title: 'Leave Request Approved',
        description: 'The leave request has been approved successfully.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Approving Leave',
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setApprovingIds(prev => {
        const newState = { ...prev };
        delete newState[leave.id];
        return newState;
      });
    }
  };

  const handleUnapprove = async (leave: LeaveRequest) => {
    // Mark this leave as being processed
    setApprovingIds(prev => ({ ...prev, [leave.id]: true }));

    try {
      // Fetch current leave credits
      const { data: profile, error: creditError } = await supabase
        .from('profiles')
        .select('al_credit, bl_credit, sl_credit')
        .eq('id', leave.user_id)
        .maybeSingle();

      if (creditError) throw creditError;
      if (!profile) throw new Error('Profile not found');

      // Determine which credit to update based on leave type
      let creditField = '';
      let newCreditValue = 0;

      // Map leave type to credit field
      if (leave.leave_type === 'AL') {
        creditField = 'al_credit';
        newCreditValue = (profile.al_credit || 0) + leave.length;
      } else if (leave.leave_type === 'BL') {
        creditField = 'bl_credit';
        newCreditValue = (profile.bl_credit || 0) + leave.length;
      } else if (leave.leave_type === 'SL') {
        creditField = 'sl_credit';
        newCreditValue = (profile.sl_credit || 0) + leave.length;
      } else {
        // For "Unpaid Leave" or any other type, no credit to return
        creditField = '';
      }

      // Only update credits if it's a credit-deductible leave type
      if (creditField) {
        // Update profile with new credit value
        const updateData = { [creditField]: newCreditValue };
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', leave.user_id);

        if (updateError) throw updateError;
      }

      // Mark leave as not approved
      const { error: unapproveError } = await supabase
        .from('leaves')
        .update({ approved: false })
        .eq('id', leave.id);

      if (unapproveError) throw unapproveError;

      // Update UI state
      setApprovedRows(prev => {
        const newState = { ...prev };
        delete newState[leave.id];
        return newState;
      });

      // Update leave credits display if credits were returned
      if (creditField && profile) {
        const updatedCredits = {
          al: creditField === 'al_credit' ? newCreditValue : profile.al_credit,
          bl: creditField === 'bl_credit' ? newCreditValue : profile.bl_credit,
          sl: creditField === 'sl_credit' ? newCreditValue : profile.sl_credit,
        };
        setLeaveCredits(updatedCredits);
      }

      // Call the refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }

      toast({
        title: 'Leave Approval Removed',
        description: 'The leave request is no longer approved.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Removing Approval',
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      // Clear the approving state regardless of outcome
      setApprovingIds(prev => {
        const newState = { ...prev };
        delete newState[leave.id];
        return newState;
      });
    }
  };

  // New function to reject leave requests
  const handleReject = async (leave: LeaveRequest) => {
    // Mark this leave as being processed
    setApprovingIds(prev => ({ ...prev, [leave.id]: true }));

    try {
      // No credit deduction needed for rejected leaves
      // Mark leave as rejected (not approved)
      const { error: rejectError } = await supabase
        .from('leaves')
        .update({ approved: false })
        .eq('id', leave.id);

      if (rejectError) throw rejectError;

      // Update UI state
      setApprovedRows(prev => {
        const newState = { ...prev };
        delete newState[leave.id];
        return newState;
      });

      // Send rejection email
      const emailResponse = await sendLeaveEmail(leave, false);
      if (!emailResponse.success) {
        console.error("Email sending failed:", emailResponse.error);
      }

      // Call the refresh callback if provided
      if (onRefresh) {
        onRefresh();
      }

      toast({
        title: 'Leave Request Rejected',
        description: 'The leave request has been rejected.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Rejecting Leave',
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      // Clear the approving state regardless of outcome
      setApprovingIds(prev => {
        const newState = { ...prev };
        delete newState[leave.id];
        return newState;
      });
    }
  };

  return { handleApproveAndUpdateCredits, handleUnapprove, handleReject };
};
