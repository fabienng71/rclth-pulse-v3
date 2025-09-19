import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchEnhancedReturnRequests, ReturnRequestWithItems } from '@/services/enhancedReturnRequestService';
import { deleteReturnRequest } from '@/components/forms/services/returnRequestService';
import { groupRequestsByMonth, filterMonthGroups, toggleMonthExpansion, setAllMonthsExpanded, MonthGroup } from '@/utils/monthGrouping';

interface ReturnRequestWithItemCount extends Omit<ReturnRequestWithItems, 'items'> {
  item_count: number;
  full_name?: string;
}

interface UseReturnRequestsProps {
  user: unknown;
  isAdmin: boolean;
}

export const useReturnRequests = ({ user, isAdmin }: UseReturnRequestsProps) => {
  const { toast } = useToast();
  
  // State
  const [requests, setRequests] = useState<ReturnRequestWithItemCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [itemDetails, setItemDetails] = useState<Record<string, unknown[]>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<ReturnRequestWithItemCount | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [monthGroups, setMonthGroups] = useState<MonthGroup<ReturnRequestWithItemCount>[]>([]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await fetchEnhancedReturnRequests(
        isAdmin, 
        (user as Record<string, unknown>)?.id as string, 
        searchQuery
      );

      if (error) {
        throw error;
      }

      const requestData = data || [];
      setRequests(requestData);
      
      // Group requests by month
      const grouped = groupRequestsByMonth(requestData);
      setMonthGroups(grouped);
    } catch (error) {
      console.error('Error fetching return requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch return requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user, searchQuery, toast]);

  // Memoized filtered month groups based on search query
  const filteredMonthGroups = useMemo(() => {
    return filterMonthGroups(monthGroups, searchQuery);
  }, [monthGroups, searchQuery]);

  // Effects
  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  // Month expansion handlers
  const handleMonthToggle = (monthKey: string) => {
    setMonthGroups(prev => toggleMonthExpansion(prev, monthKey));
  };

  const handleExpandAllMonths = () => {
    setMonthGroups(prev => setAllMonthsExpanded(prev, true));
  };

  const handleCollapseAllMonths = () => {
    setMonthGroups(prev => setAllMonthsExpanded(prev, false));
  };

  // Row expansion handler
  const toggleRowExpansion = async (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (expandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
      
      // Fetch item details if not already loaded
      if (!itemDetails[requestId]) {
        try {
          const { data: items, error } = await supabase
            .from('return_request_items')
            .select('*')
            .eq('return_request_id', requestId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          setItemDetails(prev => ({
            ...prev,
            [requestId]: items || []
          }));
        } catch (error) {
          console.error('Error fetching item details:', error);
          toast({
            title: "Error",
            description: "Failed to fetch item details",
            variant: "destructive",
          });
        }
      }
    }
    
    setExpandedRows(newExpandedRows);
  };

  // Delete handlers
  const handleDeleteClick = (request: ReturnRequestWithItemCount) => {
    setDeletingRequest(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRequest || !user) return;

    try {
      setDeleteInProgress(true);
      await deleteReturnRequest(deletingRequest.id, user as Record<string, unknown>);
      
      toast({
        title: "Success",
        description: "Return request deleted successfully",
      });
      
      // Refresh the list
      fetchRequests();
    } catch (error) {
      console.error('Error deleting return request:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? `Failed to delete: ${error.message}` 
          : "Failed to delete return request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteInProgress(false);
      setDeleteDialogOpen(false);
      setDeletingRequest(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingRequest(null);
  };

  // Utility functions
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return {
    // State
    requests,
    loading,
    searchQuery,
    expandedRows,
    itemDetails,
    deleteDialogOpen,
    deletingRequest,
    deleteInProgress,
    filteredMonthGroups,

    // Handlers
    setSearchQuery,
    handleMonthToggle,
    handleExpandAllMonths,
    handleCollapseAllMonths,
    toggleRowExpansion,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Utilities
    getStatusBadgeClass,
    getPriorityBadgeClass,
    formatDate,
  };
};