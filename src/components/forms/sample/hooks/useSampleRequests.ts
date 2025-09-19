import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSampleRequests, SampleRequest } from '@/services/sample-requests';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SampleRequestsSortField } from '../SampleRequestsTable';

export const useSampleRequests = () => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SampleRequest | null>(null);
  const [creatorFilter, setCreatorFilter] = useState('all');

  // Fetch sample requests with customer data via SQL JOIN
  const { data: requests = [], isLoading: loading, refetch: loadSampleRequests } = useQuery({
    queryKey: ['sample-requests'],
    queryFn: fetchSampleRequests,
  });

  // Use the sortable table hook with proper typing - default to descending order for created_at
  const {
    sortField,
    sortDirection,
    handleSort
  } = useSortableTable('created_at' as SampleRequestsSortField, 'desc');

  // Improved sorting logic - memoized
  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'customer_name') {
        // Sort by search_name first (from nested customers), then customer_name, then customer_code
        const aName = a.customers?.search_name || a.customers?.customer_name || a.customer_code || '';
        const bName = b.customers?.search_name || b.customers?.customer_name || b.customer_code || '';
        return aName.localeCompare(bName) * direction;
      } else if (sortField === 'follow_up_date') {
        // Handle null dates properly - nulls go to end
        if (!a.follow_up_date && !b.follow_up_date) return 0;
        if (!a.follow_up_date) return direction > 0 ? 1 : -1;
        if (!b.follow_up_date) return direction > 0 ? -1 : 1;
        return (new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime()) * direction;
      } else if (sortField === 'created_at') {
        return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * direction;
      } else if (sortField === 'items') {
        // Sort by number of items, then by first item description
        const aItems = a.items || a.sample_request_items || [];
        const bItems = b.items || b.sample_request_items || [];
        const itemCountDiff = aItems.length - bItems.length;
        if (itemCountDiff !== 0) return itemCountDiff * direction;
        
        // If same number of items, sort by first item's description
        const aFirstItem = aItems[0]?.item_code || aItems[0]?.description || '';
        const bFirstItem = bItems[0]?.item_code || bItems[0]?.description || '';
        return aFirstItem.localeCompare(bFirstItem) * direction;
      }
      
      // Fallback to string comparison
      const aValue = String(a[sortField as keyof SampleRequest] || '');
      const bValue = String(b[sortField as keyof SampleRequest] || '');
      return aValue.localeCompare(bValue) * direction;
    });
  }, [requests, sortField, sortDirection]);

  // Filter by creator - memoized
  const filteredRequests = useMemo(() => {
    return sortedRequests.filter(request => {
      if (creatorFilter === 'all') return true;
      return request.created_by_name === creatorFilter;
    });
  }, [sortedRequests, creatorFilter]);

  const handleCreatorFilterChange = (value: string) => {
    setCreatorFilter(value);
  };

  const handleViewRequest = (id: string) => {
    navigate(`/forms/sample/view/${id}`);
  };

  const handleEditRequest = (id: string) => {
    navigate(`/forms/sample/edit/${id}`);
  };

  const handleDeleteClick = (request: SampleRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRequest = async () => {
    // This will be implemented when needed, for now just close dialog
    setDeleteDialogOpen(false);
    setSelectedRequest(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatItemDescriptions = (items?: any[]) => {
    if (!items || items.length === 0) return 'No items';
    const itemCount = items.length;
    const descriptions = items.map(item => item.item_code || item.description).join(', ');
    return `${descriptions} (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
  };

  return {
    requests,
    filteredRequests,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedRequest,
    setSelectedRequest,
    creatorFilter,
    sortField,
    sortDirection,
    handleSort,
    handleCreatorFilterChange,
    handleViewRequest,
    handleEditRequest,
    handleDeleteClick,
    handleDeleteRequest,
    formatItemDescriptions,
    formatDate,
    loadSampleRequests,
    refetch: loadSampleRequests
  };
};
