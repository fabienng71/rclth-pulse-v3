import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface UseSearchAndFilterOptions<T> {
  debounceMs?: number;
  searchFields?: (keyof T)[];
  initialFilters?: Record<string, any>;
}

interface FilterConfig<T> {
  field: keyof T;
  operation: 'equals' | 'includes' | 'greaterThan' | 'lessThan' | 'custom';
  value: any;
  customFilter?: (item: T, value: any) => boolean;
}

export const useSearchAndFilter = <T extends Record<string, any>>(
  data: T[],
  options: UseSearchAndFilterOptions<T> = {}
) => {
  const {
    debounceMs = 300,
    searchFields = [],
    initialFilters = {},
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Apply search filter
  const searchFilteredData = useMemo(() => {
    if (!debouncedSearchTerm || !data.length) return data;

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return data.filter(item => {
      // If no search fields specified, search all string fields
      if (searchFields.length === 0) {
        return Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(searchLower)
        );
      }

      // Search only specified fields
      return searchFields.some(field => {
        const value = item[field];
        return typeof value === 'string' && 
               value.toLowerCase().includes(searchLower);
      });
    });
  }, [data, debouncedSearchTerm, searchFields]);

  // Apply additional filters
  const filteredData = useMemo(() => {
    if (!Object.keys(filters).length) return searchFilteredData;

    return searchFilteredData.filter(item => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true; // Skip empty filters
        }

        const itemValue = item[key];

        // Handle boolean filters
        if (typeof filterValue === 'boolean') {
          return itemValue === filterValue;
        }

        // Handle array filters (multi-select)
        if (Array.isArray(filterValue)) {
          return filterValue.length === 0 || filterValue.includes(itemValue);
        }

        // Handle string filters
        if (typeof filterValue === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        // Handle exact match
        return itemValue === filterValue;
      });
    });
  }, [searchFilteredData, filters]);

  // Advanced filtering with custom filter configs
  const applyAdvancedFilters = useMemo(() => (filterConfigs: FilterConfig<T>[]) => {
    return searchFilteredData.filter(item => {
      return filterConfigs.every(config => {
        const { field, operation, value, customFilter } = config;
        const itemValue = item[field];

        if (value === null || value === undefined || value === '') {
          return true;
        }

        switch (operation) {
          case 'equals':
            return itemValue === value;
          case 'includes':
            return typeof itemValue === 'string' && 
                   typeof value === 'string' && 
                   itemValue.toLowerCase().includes(value.toLowerCase());
          case 'greaterThan':
            return Number(itemValue) > Number(value);
          case 'lessThan':
            return Number(itemValue) < Number(value);
          case 'custom':
            return customFilter ? customFilter(item, value) : true;
          default:
            return true;
        }
      });
    });
  }, [searchFilteredData]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const stats = useMemo(() => ({
    total: data.length,
    filtered: filteredData.length,
    searchFiltered: searchFilteredData.length,
  }), [data.length, filteredData.length, searchFilteredData.length]);

  return {
    // Data
    filteredData,
    searchFilteredData,
    
    // Search
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    
    // Filters
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    
    // Advanced
    applyAdvancedFilters,
    
    // Stats
    stats,
  };
};