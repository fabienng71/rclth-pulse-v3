
// This hook is deprecated - all functionality has been moved to useOptimizedContactsData
// This file exists only for backward compatibility and should be removed in future updates

import { useOptimizedContactsData } from '@/hooks/useOptimizedContactsData';

// Re-export types from the optimized version
export type { Contact, ContactTag } from '@/hooks/useOptimizedContactsData';
export { useContactTagsContext as useContactTags } from '@/contexts/ContactTagsContext';

/**
 * @deprecated Use useOptimizedContactsData instead for better performance and server-side filtering
 * This hook now redirects to the optimized version with default parameters
 */
export function useContactsData(searchQuery: string, sortField: string, sortDirection: 'asc' | 'desc') {
  console.warn('useContactsData is deprecated. Please migrate to useOptimizedContactsData for better performance.');
  
  // Redirect to optimized version with sensible defaults
  return useOptimizedContactsData(
    searchQuery,
    sortField,
    sortDirection,
    0, // page
    50, // pageSize
    'all', // selectedSalesperson
    'all', // selectedRegion
    'all'  // selectedStatus
  );
}
