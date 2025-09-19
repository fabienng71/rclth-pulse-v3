import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchSampleRequests, SampleRequest } from '@/services/sample-requests';
import { groupRequestsByMonth, filterMonthGroups, toggleMonthExpansion, setAllMonthsExpanded, MonthGroup } from '@/utils/monthGrouping';

interface SampleRequestWithStatus extends SampleRequest {
  status: string; // Synthetic status for grouping compatibility
  priority?: string; // Optional priority for grouping compatibility
  item_count?: number; // For display
}

interface UseSampleRequestsProps {
  user: unknown;
  isAdmin: boolean;
}

export const useSampleRequests = ({ user, isAdmin }: UseSampleRequestsProps) => {
  const { toast } = useToast();
  
  // State
  const [requests, setRequests] = useState<SampleRequestWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<SampleRequestWithStatus | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [monthGroups, setMonthGroups] = useState<MonthGroup<SampleRequestWithStatus>[]>([]);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching sample requests...');
      const data = await fetchSampleRequests();
      console.log('Raw sample requests data:', data);

      // Add synthetic status and priority fields for grouping compatibility
      const requestData: SampleRequestWithStatus[] = data.map(request => ({
        ...request,
        status: 'submitted', // Synthetic status for all sample requests
        priority: undefined, // Sample requests don't have priority
        item_count: request.sample_request_items?.length || request.items?.length || 0
      }));

      console.log('Processed sample requests with status:', requestData);
      setRequests(requestData);
      
      // Group requests by month
      const grouped = groupRequestsByMonth(requestData);
      console.log('Grouped sample requests by month:', grouped);
      setMonthGroups(grouped);
    } catch (error) {
      console.error('Error fetching sample requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sample requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

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

  // Delete handlers
  const handleDeleteClick = (request: SampleRequestWithStatus) => {
    setDeletingRequest(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRequest) return;

    try {
      setDeleteInProgress(true);
      // TODO: Implement delete functionality
      console.log('Delete sample request:', deletingRequest.id);
      
      toast({
        title: "Success",
        description: "Sample request deleted successfully",
      });
      
      // Refresh requests
      await fetchRequests();
    } catch (error) {
      console.error('Error deleting sample request:', error);
      toast({
        title: "Error",
        description: "Failed to delete sample request",
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
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const getStatusBadgeClass = useCallback((status: string) => {
    // Sample requests only have 'submitted' status
    return 'bg-blue-100 text-blue-800';
  }, []);

  const getPriorityBadgeClass = useCallback((priority: string) => {
    // Sample requests don't have priority, but keeping for consistency
    return 'bg-gray-100 text-gray-800';
  }, []);

  return {
    // Data
    requests,
    loading,
    searchQuery,
    deleteDialogOpen,
    deleteInProgress,
    deletingRequest,
    filteredMonthGroups,

    // Handlers
    setSearchQuery,
    handleMonthToggle,
    handleExpandAllMonths,
    handleCollapseAllMonths,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Utilities
    getStatusBadgeClass,
    getPriorityBadgeClass,
    formatDate,
  };
};