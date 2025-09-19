
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Legacy file - notifications now handled via database triggers
// import { createAdminNotification } from '@/services/notificationService';
import { LeaveRequest, LeaveCredits } from '@/types/leave';
import { format, startOfMonth } from 'date-fns';
import { useLeaveApproval } from './useLeaveApproval';
import { toast } from 'sonner';

// Ensure LeaveType matches the database codes
export type LeaveType = 'AL' | 'BL' | 'SL' | 'Unpaid Leave';

export interface LeaveFormData {
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  length: number;
}

export const useLeaveRequests = () => {
  const { user, profile, isAdmin } = useAuthStore();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [length, setLength] = useState<number>(0);
  const [leaveType, setLeaveType] = useState<LeaveType>('AL');
  const [reason, setReason] = useState<string>('');
  const [leaveCredits, setLeaveCredits] = useState<LeaveCredits | null>(null);
  const [userCreditsMap, setUserCreditsMap] = useState<Record<string, LeaveCredits>>({});
  const [approvedRows, setApprovedRows] = useState<Record<string, boolean>>({});
  const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({});
  
  // Query for fetching leave requests
  const {
    data: leaveRequests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['leaveRequests', startDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaves')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Map leave requests to their approval status
      const newApprovedRows: Record<string, boolean> = {};
      data.forEach(leave => {
        if (leave.approved) {
          newApprovedRows[leave.id] = true;
        }
      });
      
      setApprovedRows(newApprovedRows);
      return data as LeaveRequest[];
    },
  });
  
  // Function to fetch user leave credits
  const fetchLeaveCredits = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch the user's own leave credits
      const { data, error } = await supabase
        .from('profiles')
        .select('al_credit, bl_credit, sl_credit')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setLeaveCredits({
        al: data.al_credit,
        bl: data.bl_credit,
        sl: data.sl_credit
      });
      
      // If admin, fetch all users' leave credits
      if (isAdmin) {
        const { data: allCredits, error: allCreditsError } = await supabase
          .from('profiles')
          .select('id, al_credit, bl_credit, sl_credit');
          
        if (allCreditsError) throw allCreditsError;
        
        const creditsMap: Record<string, LeaveCredits> = {};
        allCredits.forEach(cred => {
          creditsMap[cred.id] = {
            al: cred.al_credit,
            bl: cred.bl_credit,
            sl: cred.sl_credit
          };
        });
        
        setUserCreditsMap(creditsMap);
      }
    } catch (error) {
      console.error('Error fetching leave credits:', error);
    }
  };

  // Function to fetch leave requests and credits
  const fetchLeavesAndCredits = async () => {
    await fetchLeaveCredits();
  };
  
  // Use the leave approval hook
  const { handleApproveAndUpdateCredits, handleReject } = useLeaveApproval(
    setApprovedRows,
    setApprovingIds,
    setLeaveCredits,
    () => fetchLeavesAndCredits()
  );
  
  // Handler for approving leave
  const handleApproveLeave = (leave: LeaveRequest) => {
    handleApproveAndUpdateCredits(leave);
  };
  
  // Handler for rejecting leave
  const handleRejectLeave = (leave: LeaveRequest) => {
    handleReject(leave);
  };
  
  // Function to delete a leave request
  const deleteLeave = async (leaveId: string) => {
    try {
      const { error } = await supabase
        .from('leaves')
        .delete()
        .eq('id', leaveId);
        
      if (error) throw error;
      
      uiToast({
        title: 'Success',
        description: 'Leave request deleted successfully',
      });
      
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    } catch (error) {
      uiToast({
        title: 'Error',
        description: `Failed to delete leave request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };
  
  // Legacy function - admin checks now handled by database triggers
  // const checkAdminUsers = async () => { ... };
  
  // Mutation for creating a new leave request
  const createMutation = useMutation({
    mutationFn: async (formData: LeaveFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🚀 Creating leave request with data:', formData);

      // Create the new leave request
      const { data, error } = await supabase
        .from('leaves')
        .insert({
          user_id: user.id,
          leave_type: formData.leaveType,
          start_date: formData.startDate.toISOString(),
          end_date: formData.endDate.toISOString(),
          reason: formData.reason,
          length: formData.length,
          full_name: profile?.full_name,
        })
        .select()
        .single();
        
      if (error) {
        console.error('❌ Error creating leave request:', error);
        throw error;
      }

      console.log('✅ Leave request created successfully:', data);

      // Notifications are now handled automatically via database triggers
      console.log('✅ Leave request created, notifications will be sent via database triggers');
      
      return data;
    },
    onSuccess: () => {
      uiToast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      navigate('/forms/leave');
    },
    onError: (error) => {
      uiToast({
        title: 'Error',
        description: `Failed to submit leave request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });
  
  const submitLeaveRequest = () => {
    if (!startDate || !endDate) {
      uiToast({
        title: 'Error',
        description: 'Please select both start and end dates',
        variant: 'destructive',
      });
      return;
    }
    
    if (length <= 0) {
      uiToast({
        title: 'Error',
        description: 'Leave duration must be at least 1 day',
        variant: 'destructive',
      });
      return;
    }
    
    createMutation.mutate({
      leaveType,
      startDate,
      endDate,
      reason,
      length,
    });
  };
  
  // Fetch leave credits on component mount
  useEffect(() => {
    fetchLeavesAndCredits();
  }, [startDate]);
  
  // Function to prepare form data for display
  const getFormData = () => ({
    startDate,
    endDate,
    leaveType,
    reason,
    length,
  });
  
  return {
    leaveRequests,
    isLoading,
    error,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    length,
    setLength,
    leaveType,
    setLeaveType,
    reason,
    setReason,
    submitLeaveRequest,
    isSubmitting: createMutation.isPending,
    getFormData,
    // Add these properties needed by LeaveRequests component
    leaveCredits,
    userCreditsMap,
    setLeaveCredits,
    approvedRows,
    setApprovedRows,
    approvingIds,
    setApprovingIds,
    deleteLeaveRequest: deleteLeave,
    fetchLeavesAndCredits,
    handleApproveLeave,
    handleRejectLeave,
  };
};
