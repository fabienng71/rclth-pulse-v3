import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

interface UserCreditStatus {
  id: string;
  full_name: string;
  email: string;
  al_credit: number;
  sl_credit: number;
  bl_credit: number;
  role: string;
  last_updated: string;
}

interface UpdateCreditData {
  userId: string;
  al_credit?: number;
  sl_credit?: number;
  bl_credit?: number;
}

export const useUserCreditManagement = () => {
  const [users, setUsers] = useState<UserCreditStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user, userId } = useAuthStore();

  // Fetch all users with their credit status
  const fetchAllUserCredits = useCallback(async () => {
    if (!user || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('🔄 Fetching all user credits...');
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, al_credit, sl_credit, bl_credit, role, updated_at')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;

      // Transform data and ensure defaults
      const transformedUsers: UserCreditStatus[] = (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unknown User',
        email: profile.email || 'No email',
        al_credit: profile.al_credit || 0,
        sl_credit: profile.sl_credit || 0,
        bl_credit: profile.bl_credit || 0,
        role: profile.role || 'user',
        last_updated: profile.updated_at || new Date().toISOString(),
      }));

      const endTime = performance.now();
      console.log(`✅ Fetched ${transformedUsers.length} user credits in ${(endTime - startTime).toFixed(2)}ms`);
      
      setUsers(transformedUsers);
    } catch (error: any) {
      console.error('❌ Error fetching user credits:', error);
      toast({
        title: 'Error',
        description: `Failed to load user credits: ${error.message}`,
        variant: 'destructive',
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, userId, toast]);

  // Update user credits
  const updateUserCredit = useCallback(async (updateData: UpdateCreditData) => {
    if (!user || !userId) return { success: false, error: 'Not authenticated' };

    setIsUpdating(true);
    console.log('🔄 Updating user credits:', updateData);
    
    try {
      const updateFields: any = {
        updated_at: new Date().toISOString(),
      };

      // Add only provided fields
      if (updateData.al_credit !== undefined) updateFields.al_credit = updateData.al_credit;
      if (updateData.sl_credit !== undefined) updateFields.sl_credit = updateData.sl_credit;
      if (updateData.bl_credit !== undefined) updateFields.bl_credit = updateData.bl_credit;

      const { error } = await supabase
        .from('profiles')
        .update(updateFields)
        .eq('id', updateData.userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User credits updated successfully',
      });

      // Refresh the user list
      await fetchAllUserCredits();
      
      console.log('✅ User credits updated successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error updating user credits:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user credits',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsUpdating(false);
    }
  }, [user, userId, toast, fetchAllUserCredits]);

  // Export credit report
  const exportCreditReport = useCallback((usersToExport: UserCreditStatus[]) => {
    try {
      const csvHeaders = [
        'User ID',
        'Full Name',
        'Email',
        'Annual Leave Credits',
        'Sick Leave Credits',
        'Business Leave Credits',
        'Total Credits',
        'Role',
        'Last Updated'
      ];

      const csvData = usersToExport.map(user => [
        user.id,
        user.full_name,
        user.email,
        user.al_credit,
        user.sl_credit,
        user.bl_credit,
        user.al_credit + user.sl_credit + user.bl_credit,
        user.role,
        new Date(user.last_updated).toLocaleDateString()
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Add UTF-8 BOM for proper character encoding
      const utf8BOM = '\uFEFF';
      const blob = new Blob([utf8BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `user-credit-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Credit report exported successfully',
      });

      console.log('✅ Credit report exported successfully');
    } catch (error: any) {
      console.error('❌ Error exporting credit report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export credit report',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Bulk update credits (for future use)
  const bulkUpdateCredits = useCallback(async (updates: UpdateCreditData[]) => {
    if (!user || !userId) return { success: false, error: 'Not authenticated' };

    setIsUpdating(true);
    console.log('🔄 Performing bulk credit update:', updates);
    
    try {
      const promises = updates.map(update => updateUserCredit(update));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (failed > 0) {
        toast({
          title: 'Partial Success',
          description: `Updated ${successful} users, ${failed} failed`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Success',
          description: `Successfully updated ${successful} users`,
        });
      }

      console.log(`✅ Bulk update completed: ${successful} successful, ${failed} failed`);
      return { success: true, successful, failed };
    } catch (error: any) {
      console.error('❌ Error in bulk update:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform bulk update',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsUpdating(false);
    }
  }, [user, userId, toast, updateUserCredit]);

  // Initialize user credits with defaults
  const initializeUserCredits = useCallback(async (userId: string) => {
    return await updateUserCredit({
      userId,
      al_credit: 20,
      sl_credit: 10,
      bl_credit: 5,
    });
  }, [updateUserCredit]);

  // Get user statistics
  const getUserStatistics = useCallback(() => {
    if (!users.length) return null;

    const stats = {
      totalUsers: users.length,
      totalALCredits: users.reduce((sum, user) => sum + user.al_credit, 0),
      totalSLCredits: users.reduce((sum, user) => sum + user.sl_credit, 0),
      totalBLCredits: users.reduce((sum, user) => sum + user.bl_credit, 0),
      averageALCredits: users.reduce((sum, user) => sum + user.al_credit, 0) / users.length,
      lowBalanceUsers: users.filter(user => user.al_credit <= 5).length,
      zeroBalanceUsers: users.filter(user => user.al_credit <= 0).length,
      roleDistribution: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return stats;
  }, [users]);

  // Initial data load
  useEffect(() => {
    fetchAllUserCredits();
  }, [fetchAllUserCredits]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Global refresh event triggered for user credits');
      fetchAllUserCredits();
    };

    window.addEventListener('refreshUserCredits', handleRefresh);
    window.addEventListener('refreshLeaveData', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshUserCredits', handleRefresh);
      window.removeEventListener('refreshLeaveData', handleRefresh);
    };
  }, [fetchAllUserCredits]);

  return {
    users,
    isLoading,
    isUpdating,
    fetchAllUserCredits,
    updateUserCredit,
    exportCreditReport,
    bulkUpdateCredits,
    initializeUserCredits,
    getUserStatistics,
  };
};