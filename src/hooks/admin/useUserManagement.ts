
import { useUsersList } from './useUsersList';
import { useUserEditDialog, UserFormData } from './useUserEditDialog';
import { useUserStatusDialog } from './useUserStatusDialog';

export type { UserFormData };

export const useUserManagement = () => {
  const { 
    users, 
    isLoading, 
    statusFilter, 
    setStatusFilter, 
    fetchUsers 
  } = useUsersList();
  
  const { 
    selectedUser: editSelectedUser, 
    editDialogOpen, 
    setEditDialogOpen, 
    handleEditUser, 
    saveUserChanges,
    isSubmitting
  } = useUserEditDialog(fetchUsers);
  
  const { 
    selectedUser: statusSelectedUser, 
    statusDialogOpen, 
    setStatusDialogOpen, 
    handleToggleUserStatus, 
    confirmToggleUserStatus 
  } = useUserStatusDialog(fetchUsers);
  
  // Combine the selectedUser state from both dialogs for compatibility with existing components
  const selectedUser = editDialogOpen ? editSelectedUser : statusSelectedUser;

  return {
    // User list
    users,
    isLoading,
    statusFilter,
    setStatusFilter,
    fetchUsers,
    
    // Edit dialog
    selectedUser,
    editDialogOpen,
    setEditDialogOpen,
    handleEditUser,
    saveUserChanges,
    isSubmitting,
    
    // Status dialog
    statusDialogOpen,
    setStatusDialogOpen,
    handleToggleUserStatus,
    confirmToggleUserStatus
  };
};
