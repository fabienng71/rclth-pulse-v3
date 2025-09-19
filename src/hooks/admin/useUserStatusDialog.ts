
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Profile } from '../../types/supabase';

export const useUserStatusDialog = (onUserUpdated: () => Promise<void>) => {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleToggleUserStatus = (user: Profile) => {
    setSelectedUser(user);
    setStatusDialogOpen(true);
  };

  const confirmToggleUserStatus = async (currentUserId?: string) => {
    if (!selectedUser) {
      console.error('No user selected for status change');
      toast.error('No user selected for status change');
      return;
    }
    
    // Don't allow changing your own status
    if (selectedUser.id === currentUserId) {
      console.error('Cannot change your own account status');
      toast.error("You cannot change your own account status");
      setStatusDialogOpen(false);
      return;
    }

    const newStatus = !selectedUser.is_active;
    const actionType = newStatus ? 'activated' : 'deactivated';

    try {
      console.log(`Attempting to ${actionType} user with ID:`, selectedUser.id);
      
      // Use the RPC function to toggle user status
      const { error: toggleError } = await supabase.rpc('toggle_user_status', {
        user_id: selectedUser.id,
        new_status: newStatus
      });
      
      if (toggleError) {
        console.error('Error toggling user status:', toggleError);
        throw toggleError;
      }
      
      // Fetch the updated user to verify changes
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedUser.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
        throw fetchError;
      }
      
      if (!updatedUser) {
        console.error('Updated user not found after toggle operation');
        throw new Error('Failed to retrieve updated user data');
      }
      
      // Verify the status was actually changed
      if (updatedUser.is_active === selectedUser.is_active) {
        console.error('Status change failed - database value not updated');
        throw new Error('Status change failed - please try again');
      }
      
      // Update local state
      setSelectedUser(updatedUser);
      
      // Log the status change in the audit table if currentUserId exists
      if (currentUserId) {
        const { error: auditError } = await supabase
          .from('user_audit_log')
          .insert({
            user_id: selectedUser.id,
            changed_by_admin_id: currentUserId,
            change_type: actionType
          });
          
        if (auditError) {
          console.error('Error logging status change:', auditError);
          toast.error(`User ${actionType} but failed to log the action`);
        }
      }
      
      // Close the dialog and show success message
      setStatusDialogOpen(false);
      toast.success(`User ${actionType} successfully`);
      
      // Refresh the users list
      await onUserUpdated();
      
    } catch (error: any) {
      console.error('Status change operation failed:', error);
      toast.error(`Failed to ${actionType} user: ${error.message || 'Unknown error'}`);
    }
  };

  return {
    selectedUser,
    statusDialogOpen,
    setStatusDialogOpen,
    handleToggleUserStatus,
    confirmToggleUserStatus
  };
};
