import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  UserPermissionSummary, 
  PermissionManagementRequest,
  UserDataPermission,
  PermissionCategory
} from '@/types/permissions';

export const useUserPermissionsSummary = () => {
  return useQuery({
    queryKey: ['users-permissions-summary'],
    queryFn: async (): Promise<UserPermissionSummary[]> => {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('get_users_permission_summary');
      
      if (error) {
        console.error('Error fetching users permission summary:', error);
        if (error.code === 'P0001' && error.message.includes('Access denied')) {
          throw new Error('Access denied: Admin permissions required');
        }
        throw new Error(`Failed to fetch users permission summary: ${error.message}`);
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an access denied error
      if (error.message.includes('Access denied')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async (): Promise<UserDataPermission[]> => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const { data, error } = await supabase.rpc('get_user_data_permissions', {
        target_user_id: userId
      });
      
      if (error) {
        console.error('Error fetching user permissions:', error);
        throw new Error('Failed to fetch user permissions');
      }
      
      return data || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const usePermissionManagement = () => {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const managePermissionMutation = useMutation({
    mutationFn: async (request: PermissionManagementRequest) => {
      const { data, error } = await supabase.rpc('manage_user_data_permission', {
        target_user_id: request.target_user_id,
        permission: request.permission,
        grant_permission: request.grant_permission,
        admin_notes: request.admin_notes || null
      });

      if (error) {
        console.error('Error managing user permission:', error);
        throw new Error(error.message || 'Failed to update permission');
      }

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['users-permissions-summary'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions', variables.target_user_id] });
      
      toast({
        title: 'Permission updated',
        description: `Permission ${variables.grant_permission ? 'granted' : 'revoked'} successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Permission update failed',
        description: error instanceof Error ? error.message : 'Failed to update permission',
        variant: 'destructive',
      });
    },
  });

  const updatePermission = async (
    userId: string,
    permission: PermissionCategory,
    granted: boolean,
    notes?: string
  ) => {
    setIsUpdating(true);
    try {
      await managePermissionMutation.mutateAsync({
        target_user_id: userId,
        permission,
        grant_permission: granted,
        admin_notes: notes
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const bulkUpdatePermissions = async (
    userId: string,
    permissions: Array<{ permission: PermissionCategory; granted: boolean }>,
    notes?: string
  ) => {
    setIsUpdating(true);
    try {
      // Execute all permission updates in parallel
      await Promise.all(
        permissions.map(({ permission, granted }) =>
          managePermissionMutation.mutateAsync({
            target_user_id: userId,
            permission,
            grant_permission: granted,
            admin_notes: notes
          })
        )
      );
      
      toast({
        title: 'Bulk permission update completed',
        description: `Updated ${permissions.length} permissions for user.`,
      });
    } catch (error) {
      toast({
        title: 'Bulk permission update failed',
        description: 'Some permissions may not have been updated. Please check and retry.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePermission,
    bulkUpdatePermissions,
    isUpdating: isUpdating || managePermissionMutation.isPending,
  };
};