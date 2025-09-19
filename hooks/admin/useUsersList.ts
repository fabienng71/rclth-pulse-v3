
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Profile } from '../../types/supabase';

export const useUsersList = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Check if the current user has admin privileges
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        console.error('No authenticated user found when fetching users list');
        throw new Error('Authentication required');
      }
      
      console.log('Fetching users as user ID:', userId);
      
      // First check if the current user is admin
      const { data: currentUser, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching current user role:', userError);
        throw new Error('Error verifying permissions');
      }
      
      console.log('Current user role:', currentUser?.role);
      
      if (currentUser?.role !== 'admin') {
        console.error('Non-admin user attempted to fetch all users');
        toast.error('Permission denied: Admin access required');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      console.log('Fetched users:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    statusFilter,
    setStatusFilter,
    fetchUsers
  };
};
