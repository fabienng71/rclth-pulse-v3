
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Profile } from '../../types/supabase';

export interface UserFormData {
  fullName: string;
  role: string;
  sppCode: string;
  generatePassword?: boolean;
  password?: string;
  al_credit?: number | null;
  bl_credit?: number | null;
  sl_credit?: number | null;
}

export const useUserEditDialog = (onUserUpdated: () => Promise<void>) => {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const saveUserChanges = async (formData: UserFormData) => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      console.log('Saving user changes:', formData);
      
      // Important: Create an update object with the form data
      const sppCode = formData.sppCode.trim();
      const updateData: any = {
        full_name: formData.fullName,
        role: formData.role,
        // Explicitly handle the SPP code - set to null if empty string
        spp_code: sppCode === '' ? null : sppCode,
        updated_at: new Date().toISOString(),
        // Add leave credits if provided
        al_credit: formData.al_credit ?? null,
        bl_credit: formData.bl_credit ?? null,
        sl_credit: formData.sl_credit ?? null,
      };
      
      console.log('Update data being sent to Supabase:', updateData);
      console.log('Updating user with ID:', selectedUser.id);
      
      // First get the current admin user to log in audit
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id;
      
      if (!adminId) {
        console.error('No authenticated admin found when updating user');
        toast.error('Authentication required to update user');
        return;
      }
      
      // Try the update operation with more verbose debugging
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUser.id);
        
      if (error) {
        console.error('Supabase update error:', error);
        
        // Log more details about the error
        if (error.code === 'PGRST116') {
          console.error('This appears to be a Row Level Security (RLS) policy violation');
          console.error('Admin ID:', adminId);
          console.error('Target user ID:', selectedUser.id);
          
          toast.error('Permission denied: You do not have rights to update this user');
        } else {
          toast.error(`Update failed: ${error.message}`);
        }
        
        throw error;
      }
      
      // Handle password reset if requested
      if (formData.generatePassword && formData.password) {
        console.log('Password reset requested for user:', selectedUser.id);
        
        // Create an edge function call to reset password instead of using admin API directly
        // This is more secure and doesn't require the service role key in the client
        const { data: resetData, error: resetError } = await supabase.functions.invoke('reset-user-password', {
          body: {
            userId: selectedUser.id,
            newPassword: formData.password,
            adminId: adminId
          }
        });
        
        if (resetError) {
          console.error('Password reset error:', resetError);
          toast.error(`Password reset failed: ${resetError.message}`);
          throw resetError;
        }
        
        console.log('Password reset response:', resetData);
        
        // Create an audit log entry for the password reset
        const { error: auditPasswordError } = await supabase
          .from('user_audit_log')
          .insert({
            user_id: selectedUser.id,
            changed_by_admin_id: adminId,
            change_type: 'password_reset'
          });
        
        if (auditPasswordError) {
          console.warn('Failed to create audit log entry for password reset:', auditPasswordError);
        }
        
        console.log('Password reset successful');
      }
      
      console.log('User updated successfully, response data:', data);
      
      // Create an audit log entry for the user update
      const { error: auditError } = await supabase
        .from('user_audit_log')
        .insert({
          user_id: selectedUser.id,
          changed_by_admin_id: adminId,
          change_type: 'profile_updated'
        });
        
      if (auditError) {
        console.warn('Failed to create audit log entry:', auditError);
      }
      
      // Perform a fresh fetch to ensure we have the latest data
      await onUserUpdated();
      
      // Get the updated user with the correct Supabase client to verify changes
      const { data: updatedUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedUser.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error('Error fetching updated user:', fetchError);
      } else {
        console.log('Updated user details after refresh:', updatedUser);
        
        // Verify if the spp_code was actually updated
        if (updatedUser && updatedUser.spp_code !== (sppCode === '' ? null : sppCode)) {
          console.warn('SPP code didn\'t update correctly in the database! Expected:', 
            sppCode === '' ? 'null' : sppCode, 'Got:', updatedUser.spp_code);
        }
        
        // Update local state with the fresh data from the database
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
      
      // Close the dialog and show success message
      setEditDialogOpen(false);
      
      if (formData.generatePassword && formData.password) {
        toast.success('User updated successfully with new password');
      } else {
        toast.success('User updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedUser,
    editDialogOpen,
    setEditDialogOpen,
    handleEditUser,
    saveUserChanges,
    isSubmitting
  };
};
