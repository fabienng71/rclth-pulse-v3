
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export interface Item {
  item_code: string;
  description: string | null;
  unit_price: number | null;
  base_unit_code: string | null;
  posting_group: string | null;
  vendor_code: string | null;
  brand: string | null;
  attribut_1: string | null;
  pricelist?: boolean | null;
}

export interface ItemsFilters {
  categories: string[];
  brands: string[];
  vendors: string[];
  showOnlyUnassigned: boolean;
}

interface PaginationOptions {
  page: number;
  pageSize: number;
}

interface UseItemsDataOptions extends PaginationOptions {
  filters?: ItemsFilters;
}

export const useItemsData = (options: UseItemsDataOptions = { page: 1, pageSize: 50 }) => {
  const { page, pageSize, filters } = options;
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Increased debounce for better performance

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['itemsData', debouncedSearchTerm, page, pageSize, filters],
    queryFn: async () => {
      let query = supabase
        .from('items')
        .select('*', { count: 'exact' })
        .order('item_code', { ascending: true });

      // Apply search filter if provided - improved search logic
      if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 0) {
        const searchQuery = debouncedSearchTerm.trim();
        query = query.or(`item_code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Apply category filters
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('posting_group', filters.categories);
      }

      // Apply brand filters
      if (filters?.brands && filters.brands.length > 0) {
        query = query.in('brand', filters.brands);
      }

      // Apply vendor filters
      if (filters?.vendors && filters.vendors.length > 0) {
        query = query.in('vendor_code', filters.vendors);
      }

      // Apply "show only unassigned" filter
      if (filters?.showOnlyUnassigned) {
        query = query.or('posting_group.is.null,brand.is.null,vendor_code.is.null');
      }

      // Apply pagination - but be more generous with search results
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
        
      if (error) {
        console.error('Error fetching items:', error);
        throw new Error(`Failed to fetch items data: ${error.message}`);
      }
      
      return {
        items: (data as Item[]) || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    }
  });
  
  return {
    items: data?.items || [],
    filteredItems: data?.items || [], // For backward compatibility
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: page,
    pageSize: pageSize,
    isLoading,
    error,
    refetch,
    searchTerm,
    setSearchTerm
  };
};
