import { useState, useMemo } from 'react';
import { CustomerChurnAnalysis } from '@/hooks/useSalesAnalytics';
import { safeFilterArray } from '@/utils/safeSearch';
import { useSortableTable } from '@/hooks/useSortableTable';

export const useCustomerChurnFilters = (data: CustomerChurnAnalysis[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Enhanced sorting with the sortable table hook
  const { sortField, sortDirection, handleSort, sortData } = useSortableTable<keyof CustomerChurnAnalysis>('risk_score', 'desc');

  // Enhanced filter and sort data with safe handling
  const filteredAndSortedData = useMemo(() => 
    sortData(
      safeFilterArray(
        data || [],
        searchTerm,
        (customer) => [customer.customer_name, customer.customer_code, customer.salesperson_code]
      )
        .filter(customer => {
          const matchesStatus = statusFilter === 'all' || customer.churn_status === statusFilter;
          const matchesPriority = priorityFilter === 'all' || customer.recovery_priority === priorityFilter;
          
          return matchesStatus && matchesPriority;
        })
    ), [data, searchTerm, statusFilter, priorityFilter, sortData]
  );

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedData,
  };
};