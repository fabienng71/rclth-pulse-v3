import { useState, useMemo, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';
import { LeaveRequest } from '@/types/leave';

interface UseLeaveRequestsTableProps {
  requests: LeaveRequest[];
  initialPageSize?: number;
}

export const useLeaveRequestsTable = ({ 
  requests, 
  initialPageSize = 10 
}: UseLeaveRequestsTableProps) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Table states
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);

  // Selection states
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = request.user_profile?.full_name?.toLowerCase().includes(searchLower);
        const matchesEmail = request.user_profile?.email?.toLowerCase().includes(searchLower);
        const matchesReason = request.reason?.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesEmail && !matchesReason) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) {
        return false;
      }

      // Leave type filter
      if (leaveTypeFilter !== 'all' && request.leave_type !== leaveTypeFilter) {
        return false;
      }

      // Date range filter
      if (dateRange?.from || dateRange?.to) {
        const requestStart = parseISO(request.start_date);
        const requestEnd = parseISO(request.end_date);
        
        if (dateRange.from && dateRange.to) {
          // Check if request overlaps with date range
          const rangeStart = dateRange.from;
          const rangeEnd = dateRange.to;
          
          const overlaps = requestStart <= rangeEnd && requestEnd >= rangeStart;
          if (!overlaps) return false;
        } else if (dateRange.from) {
          // Only start date specified
          if (requestEnd < dateRange.from) return false;
        } else if (dateRange.to) {
          // Only end date specified
          if (requestStart > dateRange.to) return false;
        }
      }

      // Department filter (if available in user profile)
      if (departmentFilter !== 'all' && request.user_profile?.department !== departmentFilter) {
        return false;
      }

      // User filter
      if (userFilter !== 'all' && request.user_id !== userFilter) {
        return false;
      }

      return true;
    });
  }, [
    requests,
    searchTerm,
    statusFilter,
    leaveTypeFilter,
    departmentFilter,
    userFilter,
    dateRange,
  ]);

  // Sort requests
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      // Handle nested properties
      if (sortField.includes('.')) {
        const [parent, child] = sortField.split('.');
        const aParent = (a as Record<string, unknown>)[parent] as Record<string, unknown> | undefined;
        const bParent = (b as Record<string, unknown>)[parent] as Record<string, unknown> | undefined;
        aValue = aParent?.[child];
        bValue = bParent?.[child];
      } else {
        aValue = (a as Record<string, unknown>)[sortField];
        bValue = (b as Record<string, unknown>)[sortField];
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle dates
      if (sortField.includes('date') || sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings and dates
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredRequests, sortField, sortDirection]);

  // Paginate requests
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedRequests, currentPage, itemsPerPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);
  const totalRequests = requests.length;
  const filteredCount = sortedRequests.length;

  // Handlers
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortField, sortDirection]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedRequests(new Set()); // Clear selections when changing pages
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedRequests(new Set());
  }, []);

  const handleSelectRequest = useCallback((requestId: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(requestId);
    } else {
      newSelected.delete(requestId);
    }
    setSelectedRequests(newSelected);
  }, [selectedRequests]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const pageRequestIds = paginatedRequests.map(r => r.id);
      setSelectedRequests(new Set([...selectedRequests, ...pageRequestIds]));
    } else {
      const pageRequestIds = new Set(paginatedRequests.map(r => r.id));
      const newSelected = new Set([...selectedRequests].filter(id => !pageRequestIds.has(id)));
      setSelectedRequests(newSelected);
    }
  }, [selectedRequests, paginatedRequests]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setLeaveTypeFilter('all');
    setDepartmentFilter('all');
    setUserFilter('all');
    setDateRange(undefined);
    setCurrentPage(1);
    setSelectedRequests(new Set());
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || 
           statusFilter !== 'all' || 
           leaveTypeFilter !== 'all' || 
           departmentFilter !== 'all' || 
           userFilter !== 'all' || 
           dateRange?.from || 
           dateRange?.to;
  }, [searchTerm, statusFilter, leaveTypeFilter, departmentFilter, userFilter, dateRange]);

  // Selection helpers
  const isAllPageSelected = paginatedRequests.length > 0 && 
    paginatedRequests.every(request => selectedRequests.has(request.id));
  
  const isPartiallySelected = paginatedRequests.some(request => selectedRequests.has(request.id)) && 
    !isAllPageSelected;

  return {
    // Data
    paginatedRequests,
    totalRequests,
    filteredCount,
    totalPages,
    currentPage,
    itemsPerPage,

    // Filter states
    searchTerm,
    statusFilter,
    leaveTypeFilter,
    departmentFilter,
    userFilter,
    dateRange,
    showAdvancedFilters,
    hasActiveFilters,

    // Sort states
    sortField,
    sortDirection,

    // Selection states
    selectedRequests,
    isAllPageSelected,
    isPartiallySelected,

    // Processing states
    isProcessing,

    // Handlers
    setSearchTerm,
    setStatusFilter,
    setLeaveTypeFilter,
    setDepartmentFilter,
    setUserFilter,
    setDateRange,
    setShowAdvancedFilters,
    handleSort,
    handlePageChange,
    handleItemsPerPageChange,
    handleSelectRequest,
    handleSelectAll,
    clearAllFilters,
    setIsProcessing,
    setSelectedRequests,
  };
};