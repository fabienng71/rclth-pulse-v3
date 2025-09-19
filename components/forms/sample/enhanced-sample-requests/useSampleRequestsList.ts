import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { SampleRequest } from '@/services/sample-requests';
import { useSampleRequests } from '../hooks/useSampleRequests';
import { groupRequestsByMonth, toggleMonthExpansion, setAllMonthsExpanded, MonthGroup } from '@/utils/monthGrouping';

type ViewMode = 'table' | 'grid' | 'compact';

export const useSampleRequestsList = () => {
  const navigate = useNavigate();
  const {
    requests,
    filteredRequests,
    loading,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedRequest,
    setSelectedRequest,
    handleDeleteRequest,
    refetch,
    sortField,
    sortDirection,
    handleSort,
    creatorFilter: oldCreatorFilter,
    handleCreatorFilterChange: oldHandleCreatorFilterChange
  } = useSampleRequests();

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [monthGroups, setMonthGroups] = useState<MonthGroup[]>([]);

  // Get unique creators for filter
  const uniqueCreators = useMemo(() => {
    const creators = requests?.map(r => r.created_by_name).filter(Boolean) || [];
    return [...new Set(creators)].sort();
  }, [requests]);

  // Handle creator filter change - memoized
  const handleCreatorFilterChange = useCallback((value: string) => {
    setCreatorFilter(value);
  }, []);

  // Month expansion handlers - memoized
  const handleMonthToggle = useCallback((monthKey: string) => {
    setMonthGroups(prev => toggleMonthExpansion(prev, monthKey));
  }, []);

  const handleExpandAllMonths = useCallback(() => {
    setMonthGroups(prev => setAllMonthsExpanded(prev, true));
  }, []);

  const handleCollapseAllMonths = useCallback(() => {
    setMonthGroups(prev => setAllMonthsExpanded(prev, false));
  }, []);

  // Format helper functions - memoized
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  }, []);

  const formatItemDescriptions = useCallback((items: any[]) => {
    if (!items || items.length === 0) return 'No items';
    return items.map(item => item.item_description || item.description || 'Unknown item').join(', ');
  }, []);

  // Navigation handlers - memoized
  const handleViewRequest = useCallback((id: string) => {
    navigate(`/forms/sample/view/${id}`);
  }, [navigate]);

  const handleEditRequest = useCallback((id: string) => {
    navigate(`/forms/sample/edit/${id}`);
  }, [navigate]);

  const handleNewRequest = useCallback(() => {
    navigate('/forms/sample/create');
  }, [navigate]);

  const handleDeleteClick = useCallback((request: SampleRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  }, []);

  // Create a reusable filter function - memoized
  const createRequestFilter = useCallback((request: any) => {
    const matchesSearch = !searchQuery || 
      request.customers?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.customer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.customers?.search_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatItemDescriptions(request.items || request.sample_request_items).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDateRange = !dateRange?.from || !dateRange?.to ||
      (new Date(request.created_at) >= dateRange.from && new Date(request.created_at) <= dateRange.to);
    
    const matchesCreator = creatorFilter === 'all' || request.created_by_name === creatorFilter;
    
    return matchesSearch && matchesDateRange && matchesCreator;
  }, [searchQuery, dateRange, creatorFilter, formatItemDescriptions]);

  // Filter requests based on local filters - memoized
  const localFilteredRequests = useMemo(() => 
    filteredRequests.filter(createRequestFilter),
    [filteredRequests, createRequestFilter]
  );

  // Create filtered month groups
  const filteredMonthGroups = useMemo(() => {
    // Safety check for empty or invalid monthGroups
    if (!monthGroups || monthGroups.length === 0) {
      return [];
    }
    
    // Ensure all monthGroups have required properties
    const validMonthGroups = monthGroups.filter(group => 
      group && 
      group.monthKey && 
      group.displayName && 
      Array.isArray(group.requests)
    );
    
    if (!searchQuery && !dateRange?.from && !dateRange?.to && creatorFilter === 'all') {
      return validMonthGroups;
    }
    
    // Filter month groups using the same filter function
    const filtered = validMonthGroups.map(group => ({
      ...group, 
      requests: group.requests.filter(createRequestFilter)
    })).filter(group => group.requests.length > 0);
    
    return filtered;
  }, [monthGroups, createRequestFilter]);

  // Update month groups when raw requests or creator filter changes
  useEffect(() => {
    const rawRequests = requests || [];
    let filteredByCreator = rawRequests;
    
    if (creatorFilter !== 'all') {
      filteredByCreator = rawRequests.filter(r => r.created_by_name === creatorFilter);
    }
    
    // Use requests as-is without manual transformation - SQL JOIN provides the data we need
    const grouped = groupRequestsByMonth(filteredByCreator);
    setMonthGroups(grouped);
  }, [requests, creatorFilter]);

  // Check for active filters
  const hasActiveFilters = searchQuery || dateRange?.from || creatorFilter !== 'all';

  return {
    // Data
    requests,
    filteredRequests: localFilteredRequests,
    loading,
    filteredMonthGroups,
    uniqueCreators,
    
    // UI State
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    dateRange,
    setDateRange,
    creatorFilter,
    handleCreatorFilterChange,
    hasActiveFilters,
    
    // Dialog State
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedRequest,
    
    // Handlers
    handleMonthToggle,
    handleExpandAllMonths,
    handleCollapseAllMonths,
    handleViewRequest,
    handleEditRequest,
    handleNewRequest,
    handleDeleteClick,
    handleExport,
    handleDeleteRequest,
    
    // Utilities
    formatDate,
    formatItemDescriptions,
    refetch,
    
    // Sorting state
    sortField,
    sortDirection,
    handleSort,
    creatorFilter: oldCreatorFilter
  };
};