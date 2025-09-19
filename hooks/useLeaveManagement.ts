import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { 
  LeaveRequest, 
  LeaveBalance, 
  LeaveFormData, 
  LeaveApprovalData, 
  LeaveRequestFilters,
  LeaveStats
} from '@/types/leave';

export const useLeaveManagement = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [publicHolidays, setPublicHolidays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, userId, isLoggedIn } = useAuthStore();

  // Fetch leave requests with optional filters
  const fetchRequests = useCallback(async (filters?: LeaveRequestFilters) => {
    if (!user || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('🔄 Fetching leave requests...');
    const startTime = performance.now();
    
    try {
      // First check if table exists
      const { count, error: countError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Database error:', countError);
        throw new Error(`Database not ready: ${countError.message}`);
      }
      
      console.log(`📊 Found ${count} total leave requests in database`);
      
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email,
            al_credit,
            sl_credit,
            bl_credit,
            leave_balance
          ),
          approver_profile:profiles!approved_by (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Limit initial load

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.leave_type) {
        query = query.eq('leave_type', filters.leave_type);
      }
      if (filters?.start_date) {
        query = query.gte('start_date', filters.start_date);
      }
      if (filters?.end_date) {
        query = query.lte('end_date', filters.end_date);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Database query error:', error);
        throw error;
      }

      console.log('📊 Database returned:', data?.length || 0, 'records');
      console.log('📊 Sample data:', data?.slice(0, 2));
      
      // Debug: Test raw query without RLS to see if data exists
      const { data: rawData, error: rawError } = await supabase
        .from('leave_requests')
        .select('id, user_id, leave_type, status, created_at')
        .limit(5);
      
      console.log('📊 Raw data (bypassing RLS):', rawData?.length || 0, 'records');
      console.log('📊 Raw sample:', rawData?.slice(0, 2));
      
      if (rawError) {
        console.error('❌ Raw query error:', rawError);
      }

      // Filter by search term on client side if provided
      let filteredData = data || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(req => 
          req.user_profile?.full_name?.toLowerCase().includes(searchLower) ||
          req.user_profile?.email?.toLowerCase().includes(searchLower) ||
          req.reason.toLowerCase().includes(searchLower)
        );
      }

      const endTime = performance.now();
      console.log(`✅ Fetched ${filteredData.length} leave requests in ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 Raw data from database:', data);
      console.log('📊 Filtered data:', filteredData);
      
      setRequests(filteredData);
    } catch (error: any) {
      console.error('❌ Error fetching leave requests:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch leave requests: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, userId, toast]);

  // Fetch user's leave balance
  const fetchBalance = useCallback(async () => {
    if (!user || !userId) {
      setBalance(null);
      return;
    }

    console.log('🔄 Fetching leave balance...');
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('al_credit, sl_credit, bl_credit, leave_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`✅ Fetched leave balance in ${(endTime - startTime).toFixed(2)}ms:`, data);
      console.log('💰 Balance details:', {
        al_credit: data?.al_credit,
        sl_credit: data?.sl_credit,
        bl_credit: data?.bl_credit,
        leave_balance: data?.leave_balance
      });
      
      // Check if user has initial credits set, if not initialize them
      if (!data?.al_credit && !data?.sl_credit && !data?.bl_credit) {
        console.log('⚠️ User has no leave credits, initializing defaults...');
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            al_credit: 20,
            sl_credit: 10,
            bl_credit: 5,
            leave_balance: 35
          })
          .eq('id', userId)
          .select('al_credit, sl_credit, bl_credit, leave_balance')
          .single();
          
        if (updateError) {
          console.error('❌ Error initializing credits:', updateError);
          setBalance(data);
        } else {
          console.log('✅ Credits initialized:', updatedProfile);
          setBalance(updatedProfile);
        }
      } else {
        setBalance(data);
      }
    } catch (error: any) {
      console.error('❌ Error fetching leave balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leave balance',
        variant: 'destructive',
      });
      // Set default balance if fetch fails
      setBalance({
        al_credit: 0,
        sl_credit: 0,
        bl_credit: 0,
        leave_balance: 0
      });
    }
  }, [user, userId, toast]);

  // Fetch leave statistics
  const fetchStats = useCallback(async () => {
    if (!user || !userId) return;

    console.log('📊 Fetching leave statistics...');
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('status, duration_days');

      if (error) throw error;

      const stats: LeaveStats = {
        total_requests: data.length,
        pending_requests: data.filter(r => r.status === 'Pending').length,
        approved_requests: data.filter(r => r.status === 'Approved').length,
        denied_requests: data.filter(r => r.status === 'Denied').length,
        total_days_requested: data.reduce((sum, r) => sum + r.duration_days, 0),
        total_days_approved: data
          .filter(r => r.status === 'Approved')
          .reduce((sum, r) => sum + r.duration_days, 0),
      };

      const endTime = performance.now();
      console.log(`✅ Fetched leave stats in ${(endTime - startTime).toFixed(2)}ms:`, stats);
      
      setStats(stats);
    } catch (error: any) {
      console.error('❌ Error fetching leave stats:', error);
      // Set default stats if fetch fails
      setStats({
        total_requests: 0,
        pending_requests: 0,
        approved_requests: 0,
        denied_requests: 0,
        total_days_requested: 0,
        total_days_approved: 0,
      });
    }
  }, [user, userId]);

  // Fetch public holidays
  const fetchPublicHolidays = useCallback(async () => {
    console.log('🏖️ Fetching public holidays...');
    const startTime = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('public_holidays')
        .select('*')
        .order('holiday_date', { ascending: true });
      
      if (error) throw error;
      
      const endTime = performance.now();
      console.log(`✅ Fetched ${data.length} public holidays in ${(endTime - startTime).toFixed(2)}ms`);
      
      setPublicHolidays(data || []);
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching public holidays:', error);
      setPublicHolidays([]);
      return [];
    }
  }, []);

  // Calculate business days between two dates - simplified version
  const calculateBusinessDays = useCallback(async (startDate: string, endDate: string): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('calculate_business_days', {
        start_date: startDate,
        end_date: endDate
      });

      if (error) {
        // Fallback to simple calculation
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
      }
      
      return data || 0;
    } catch (error: any) {
      // Fallback calculation
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
  }, []);

  // Submit leave request
  const submitRequest = useCallback(async (formData: LeaveFormData) => {
    if (!user || !userId) return { success: false, error: 'Not authenticated' };

    setIsSubmitting(true);
    try {
      // Calculate duration
      const duration = await calculateBusinessDays(formData.start_date, formData.end_date);

      if (duration <= 0) {
        throw new Error('Invalid date range');
      }

      // Check if user has sufficient balance (only for Annual Leave)
      if (balance && formData.leave_type === 'Annual') {
        const availableCredit = balance.al_credit || 0;
        if (availableCredit < duration) {
          throw new Error(`Insufficient ${formData.leave_type} credits. You have ${availableCredit} days available.`);
        }
      }
      // Sick Leave and Business Leave are unlimited, no validation needed

      const { data, error } = await supabase
        .from('leave_requests')
        .insert([{
          user_id: userId,
          start_date: formData.start_date,
          end_date: formData.end_date,
          leave_type: formData.leave_type,
          reason: formData.reason,
          duration_days: duration,
          status: 'Pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });

      // Refresh data manually
      console.log('🔄 Refreshing data after submit...');
      
      // Refresh balance
      const balanceResult = await supabase
        .from('profiles')
        .select('al_credit, sl_credit, bl_credit, leave_balance')
        .eq('id', userId)
        .single();
      
      if (balanceResult.data) {
        setBalance(balanceResult.data);
      }
      
      // Refresh requests
      const requestsResult = await supabase
        .from('leave_requests')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email,
            al_credit,
            sl_credit,
            bl_credit,
            leave_balance
          ),
          approver_profile:profiles!approved_by (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (requestsResult.data) {
        setRequests(requestsResult.data);
      }
      
      console.log('✅ Data refreshed after submit');

      return { success: true, data };
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit leave request',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user, userId, toast, balance, calculateBusinessDays]);

  // Approve leave request
  const approveRequest = useCallback(async (requestId: string) => {
    if (!user || !userId) return { success: false, error: 'Not authenticated' };

    console.log('🔄 Starting approval process...');
    console.log('Request ID:', requestId);
    console.log('Approver ID:', userId);
    
    // First, test if the RPC function is accessible
    console.log('🔎 Testing RPC function access...');
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('approve_leave_request', {
        request_id: requestId,
        approver_id: userId
      });

      console.log('📨 RPC response:', { data, error });

      if (error) {
        console.error('❌ RPC error:', error);
        toast({
          title: 'RPC Error',
          description: `Database function error: ${error.message}`,
          variant: 'destructive',
        });
        throw error;
      }

      if (!data) {
        console.error('❌ RPC returned null data');
        toast({
          title: 'Error',
          description: 'No response from approval function',
          variant: 'destructive',
        });
        throw new Error('No response from approval function');
      }

      if (!data?.success) {
        console.error('❌ RPC returned failure:', data);
        toast({
          title: 'Approval Failed',
          description: `${data?.error || 'Unknown error'}`,
          variant: 'destructive',
        });
        throw new Error(data?.error || 'Unknown error');
      }

      console.log('✅ Approval successful:', data);
      console.log('💰 New credit after approval:', data.new_credit);

      toast({
        title: 'Success',
        description: 'Leave request approved successfully',
      });

      // Refresh data manually
      console.log('🔄 Refreshing data after approval...');
      
      // Refresh requests
      const requestsResult = await supabase
        .from('leave_requests')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email,
            al_credit,
            sl_credit,
            bl_credit,
            leave_balance
          ),
          approver_profile:profiles!approved_by (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (requestsResult.data) {
        setRequests(requestsResult.data);
      }
      
      // Also refresh balance for the current user in case they approved their own request
      const balanceResult = await supabase
        .from('profiles')
        .select('al_credit, sl_credit, bl_credit, leave_balance, role, email')
        .eq('id', userId)
        .single();
      
      if (balanceResult.data) {
        setBalance(balanceResult.data);
        console.log('💰 Balance refreshed after approval:', balanceResult.data);
      }
      
      console.log('✅ Data refreshed after approval');

      return { success: true };
    } catch (error: any) {
      console.error('Error approving leave request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve leave request',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user, userId, toast]);

  // Deny leave request
  const denyRequest = useCallback(async (requestId: string, denialReason: string) => {
    if (!user || !userId) return { success: false, error: 'Not authenticated' };

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('deny_leave_request', {
        request_id: requestId,
        approver_id: userId,
        denial_reason_text: denialReason
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: 'Leave request denied successfully',
      });

      // Refresh data manually
      console.log('🔄 Refreshing data after denial...');
      
      // Refresh requests
      const requestsResult = await supabase
        .from('leave_requests')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email,
            al_credit,
            sl_credit,
            bl_credit,
            leave_balance
          ),
          approver_profile:profiles!approved_by (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (requestsResult.data) {
        setRequests(requestsResult.data);
      }
      
      // Also refresh balance for the current user
      const balanceResult = await supabase
        .from('profiles')
        .select('al_credit, sl_credit, bl_credit, leave_balance, role, email')
        .eq('id', userId)
        .single();
      
      if (balanceResult.data) {
        setBalance(balanceResult.data);
        console.log('💰 Balance refreshed after denial:', balanceResult.data);
      }
      
      console.log('✅ Data refreshed after denial');

      return { success: true };
    } catch (error: any) {
      console.error('Error denying leave request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to deny leave request',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user, userId, toast]);

  // Delete leave request (only pending requests)
  const deleteRequest = useCallback(async (requestId: string) => {
    if (!user || !userId) return { success: false, error: 'Not authenticated' };

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', requestId)
        .eq('status', 'Pending'); // Only allow deletion of pending requests

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Leave request deleted successfully',
      });

      // Refresh data manually
      console.log('🔄 Refreshing data after deletion...');
      
      // Refresh requests
      const requestsResult = await supabase
        .from('leave_requests')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email,
            al_credit,
            sl_credit,
            bl_credit,
            leave_balance
          ),
          approver_profile:profiles!approved_by (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (requestsResult.data) {
        setRequests(requestsResult.data);
      }
      
      console.log('✅ Data refreshed after deletion');

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting leave request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete leave request',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user, userId, toast]);

  // Revert leave approval
  const revertApproval = useCallback(async (requestId: string) => {
    if (!user || !userId) return { success: false, error: 'Not authenticated' };

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('revert_leave_approval', {
        request_id: requestId,
        reverter_id: userId
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: `Leave approval reverted successfully. ${data.restored_credit} ${data.leave_type} days restored.`,
      });

      // Refresh data manually
      console.log('🔄 Refreshing data after revert...');
      
      // Refresh requests
      const requestsResult = await supabase
        .from('leave_requests')
        .select(`
          *,
          user_profile:profiles!user_id (
            full_name,
            email,
            al_credit,
            sl_credit,
            bl_credit,
            leave_balance
          ),
          approver_profile:profiles!approved_by (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (requestsResult.data) {
        setRequests(requestsResult.data);
      }
      
      // Refresh balance
      const balanceResult = await supabase
        .from('profiles')
        .select('al_credit, sl_credit, bl_credit, leave_balance')
        .eq('id', userId)
        .single();
      
      if (balanceResult.data) {
        setBalance(balanceResult.data);
      }
      
      console.log('✅ Data refreshed after revert');

      return { success: true };
    } catch (error: any) {
      console.error('Error reverting leave approval:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to revert leave approval',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [user, userId, toast]);

  // Initial data fetch - load sequentially for better performance
  useEffect(() => {
    if (!user || !userId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      console.log('🚀 Starting leave management data load...');
      setIsLoading(true);
      
      try {
        // Load balance first (fastest)
        console.log('🔄 Loading balance...');
        const balanceResult = await supabase
          .from('profiles')
          .select('al_credit, sl_credit, bl_credit, leave_balance, role, email')
          .eq('id', userId)
          .single();

        if (balanceResult.error) throw balanceResult.error;
        
        // Check if user has initial credits set, if not initialize them
        if (!balanceResult.data?.al_credit && !balanceResult.data?.sl_credit && !balanceResult.data?.bl_credit) {
          console.log('⚠️ User has no leave credits, initializing defaults...');
          
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              al_credit: 20,
              sl_credit: 10,
              bl_credit: 5,
              leave_balance: 35
            })
            .eq('id', userId)
            .select('al_credit, sl_credit, bl_credit, leave_balance, role, email')
            .single();
            
          if (updateError) {
            console.error('❌ Error initializing credits:', updateError);
            setBalance(balanceResult.data);
          } else {
            console.log('✅ Credits initialized:', updatedProfile);
            setBalance(updatedProfile);
          }
        } else {
          setBalance(balanceResult.data);
        }
        
        console.log('✅ Balance loaded');
        console.log('👤 User profile:', balanceResult.data);
      
        // Test RLS function
        const { data: isManager, error: managerError } = await supabase
          .rpc('is_admin_or_manager');
        console.log('🔑 Is manager/admin:', isManager, 'Error:', managerError);
        
        // Test approval function access (without actually approving)
        console.log('🔎 Testing approval function access...');
        const { data: testApproval, error: testError } = await supabase
          .rpc('approve_leave_request', {
            request_id: '00000000-0000-0000-0000-000000000000', // fake ID
            approver_id: userId
          });
        console.log('🔎 Test approval result:', testApproval, 'Error:', testError);

        // Then load requests (main data)
        console.log('🔄 Loading requests...');
        const requestsResult = await supabase
          .from('leave_requests')
          .select(`
            *,
            user_profile:profiles!user_id (
              full_name,
              email,
              al_credit,
              sl_credit,
              bl_credit,
              leave_balance
            ),
            approver_profile:profiles!approved_by (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (requestsResult.error) throw requestsResult.error;
        setRequests(requestsResult.data || []);
        console.log('✅ Requests loaded');

        // Finally load stats (optional)
        console.log('🔄 Loading stats...');
        const statsResult = await supabase
          .from('leave_requests')
          .select('status, duration_days');

        if (statsResult.error) throw statsResult.error;
        
        const statsData = statsResult.data || [];
        const calculatedStats = {
          total_requests: statsData.length,
          pending_requests: statsData.filter(r => r.status === 'Pending').length,
          approved_requests: statsData.filter(r => r.status === 'Approved').length,
          denied_requests: statsData.filter(r => r.status === 'Denied').length,
          total_days_requested: statsData.reduce((sum, r) => sum + r.duration_days, 0),
          total_days_approved: statsData
            .filter(r => r.status === 'Approved')
            .reduce((sum, r) => sum + r.duration_days, 0),
        };
        
        setStats(calculatedStats);
        console.log('✅ Stats loaded');
        
        // Finally load public holidays
        console.log('🔄 Loading public holidays...');
        const holidaysResult = await supabase
          .from('public_holidays')
          .select('*')
          .order('holiday_date', { ascending: true });
        
        if (holidaysResult.error) {
          console.error('❌ Error loading holidays:', holidaysResult.error);
          setPublicHolidays([]);
        } else {
          setPublicHolidays(holidaysResult.data || []);
          console.log(`✅ Loaded ${holidaysResult.data?.length || 0} public holidays`);
        }
        
        console.log('✅ Leave management data loaded completely');
      } catch (error: any) {
        console.error('❌ Error loading leave management data:', error);
        toast({
          title: 'Error',
          description: `Failed to load leave management data: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId, toast]); // Only depend on user ID and toast

  // Listen for global refresh events and window focus
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Global refresh event triggered');
      if (user && userId) {
        // Show loading state during refresh
        setIsLoading(true);
        
        // Refresh balance, requests, and holidays
        Promise.all([
          fetchBalance(),
          fetchRequests(),
          fetchPublicHolidays()
        ]).finally(() => {
          setIsLoading(false);
        });
      }
    };

    const handleWindowFocus = () => {
      console.log('🔄 Window focused, refreshing data');
      if (user && userId) {
        // Refresh data when user comes back to the window
        Promise.all([
          fetchBalance(),
          fetchRequests(),
          fetchPublicHolidays()
        ]);
      }
    };

    window.addEventListener('refreshLeaveData', handleRefresh);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('refreshLeaveData', handleRefresh);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user, userId, fetchBalance, fetchRequests]);

  return {
    requests,
    balance,
    stats,
    publicHolidays,
    isLoading,
    isSubmitting,
    fetchRequests,
    fetchBalance,
    fetchStats,
    fetchPublicHolidays,
    calculateBusinessDays,
    submitRequest,
    approveRequest,
    denyRequest,
    deleteRequest,
    revertApproval,
  };
};