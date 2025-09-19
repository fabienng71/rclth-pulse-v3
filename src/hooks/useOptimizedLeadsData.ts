
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export interface Lead {
  id: string;
  customer_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  updated_at: string | null;
  full_name: string | null;
  salesperson_code: string | null;
  industry: string | null;
  website: string | null;
  instagram_handle: string | null;
  notes: string | null;
  created_at: string | null;
  active: boolean;
}

export function useOptimizedLeadsData(
  searchQuery: string, 
  sortField: string, 
  sortDirection: 'asc' | 'desc',
  page: number = 0,
  pageSize: number = 50,
  selectedSalesperson: string = 'all',
  selectedStatus: string = 'all'
) {
  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leads', debouncedSearch, sortField, sortDirection, page, pageSize, selectedSalesperson, selectedStatus],
    queryFn: async () => {
      console.log('Fetching leads with filters:', {
        page, 
        pageSize, 
        search: debouncedSearch,
        salesperson: selectedSalesperson,
        status: selectedStatus
      });
      
      let query = supabase
        .from('leads')
        .select('*')
        .eq('active', true)
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Apply search filter
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase().trim();
        query = query.or(
          `customer_name.ilike.%${searchTerm}%,` +
          `contact_name.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `phone.ilike.%${searchTerm}%,` +
          `industry.ilike.%${searchTerm}%`
        );
      }

      // Apply server-side filters
      if (selectedSalesperson !== 'all') {
        query = query.eq('full_name', selectedSalesperson);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle errors
  if (error) {
    console.error('Error fetching leads:', error);
    toast({
      title: "Error",
      description: "Failed to load leads. Please try again.",
      variant: "destructive",
    });
  }

  return { 
    leads: data || [], 
    loading: isLoading,
    error,
    refetch
  };
}

// Hook for getting filtered leads count (for pagination)
export function useLeadsCount(
  searchQuery: string,
  selectedSalesperson: string = 'all',
  selectedStatus: string = 'all'
) {
  const debouncedSearch = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: ['leads-count', debouncedSearch, selectedSalesperson, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Apply search filter
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase().trim();
        query = query.or(
          `customer_name.ilike.%${searchTerm}%,` +
          `contact_name.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `phone.ilike.%${searchTerm}%,` +
          `industry.ilike.%${searchTerm}%`
        );
      }

      // Apply server-side filters
      if (selectedSalesperson !== 'all') {
        query = query.eq('full_name', selectedSalesperson);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
