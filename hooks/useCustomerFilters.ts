
import { useState, useMemo } from 'react';
import { CustomerWithAnalytics } from './useCustomersWithAnalytics';

export interface CustomerFiltersState {
  searchQuery: string;
  hideZeroTurnover: boolean;
  selectedSalesperson: string;
}

export const useCustomerFilters = (customers: CustomerWithAnalytics[]) => {
  const [filters, setFilters] = useState<CustomerFiltersState>({
    searchQuery: '',
    hideZeroTurnover: false,
    selectedSalesperson: 'all'
  });

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Apply zero turnover filter
    if (filters.hideZeroTurnover) {
      filtered = filtered.filter(customer => customer.total_turnover > 0);
    }

    // Apply salesperson filter
    if (filters.selectedSalesperson !== 'all') {
      filtered = filtered.filter(customer => 
        customer.salesperson_code === filters.selectedSalesperson
      );
    }

    return filtered;
  }, [customers, filters.hideZeroTurnover, filters.selectedSalesperson]);

  const updateFilter = (key: keyof CustomerFiltersState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    filters,
    filteredCustomers,
    updateFilter,
    setFilters
  };
};
