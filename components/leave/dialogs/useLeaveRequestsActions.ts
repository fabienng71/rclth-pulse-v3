import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeaveRequest } from '@/types/leave';
import { useLeaveManagement } from '@/hooks/useLeaveManagement';

export const useLeaveRequestsActions = () => {
  const navigate = useNavigate();
  const { approveRequest, denyRequest, deleteRequest, revertApproval, fetchRequests, isSubmitting } = useLeaveManagement();
  
  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDenialDialog, setShowDenialDialog] = useState(false);

  const handleApprove = useCallback(async (request: LeaveRequest) => {
    try {
      await approveRequest(request.id);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  }, [approveRequest, fetchRequests]);

  const handleDeny = useCallback(async (request: LeaveRequest, reason: string) => {
    try {
      await denyRequest(request.id, reason);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to deny request:', error);
    }
  }, [denyRequest, fetchRequests]);

  const handleDelete = useCallback(async (request: LeaveRequest) => {
    try {
      await deleteRequest(request.id);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  }, [deleteRequest, fetchRequests]);

  const handleRevert = useCallback(async (request: LeaveRequest) => {
    try {
      await revertApproval(request.id);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to revert request:', error);
    }
  }, [revertApproval, fetchRequests]);

  const handleView = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  }, []);

  const handleEdit = useCallback((request: LeaveRequest) => {
    navigate('/forms/leave', { state: { leaveToEdit: request } });
  }, [navigate]);

  const handleCreateRequest = useCallback(() => {
    navigate('/forms/leave');
  }, [navigate]);

  const handleExportToCSV = useCallback(() => {
    console.log('Exporting to CSV...');
  }, []);

  const handleExportToPDF = useCallback(() => {
    console.log('Exporting to PDF...');
  }, []);

  const handleDenyAction = useCallback((request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowDenialDialog(true);
  }, []);

  const closeDialogs = useCallback(() => {
    setShowDetails(false);
    setShowDenialDialog(false);
    setSelectedRequest(null);
  }, []);

  return {
    // Handlers
    handleApprove,
    handleDeny,
    handleDelete,
    handleRevert,
    handleView,
    handleEdit,
    handleCreateRequest,
    handleExportToCSV,
    handleExportToPDF,
    handleDenyAction,
    closeDialogs,
    
    // State
    selectedRequest,
    showDetails,
    showDenialDialog,
    isSubmitting,
    
    // Setters
    setShowDetails,
    setShowDenialDialog,
  };
};