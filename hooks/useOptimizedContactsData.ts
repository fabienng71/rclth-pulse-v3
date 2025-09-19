
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export interface ContactTag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  account: string;
  position: string;
  email: string;
  telephone: string;
  whatsapp: string;
  line_id: string;
  region: string;
  salesperson: string | null;
  salesperson_name?: string | null; // Display name from profiles join
  customer_code: string | null;
  customer_name: string | null;
  status: string;
  last_contact_date: string | null;
  health_score: number;
  notes_count: number;
  photo_url: string | null;
  tags?: ContactTag[];
}

export function useOptimizedContactsData(
  searchQuery: string, 
  sortField: string, 
  sortDirection: 'asc' | 'desc',
  page: number = 0,
  pageSize: number = 50,
  selectedSalesperson: string = 'all',
  selectedRegion: string = 'all',
  selectedStatus: string = 'all'
) {
  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['contacts', debouncedSearch, sortField, sortDirection, page, pageSize, selectedSalesperson, selectedRegion, selectedStatus],
    queryFn: async () => {
      console.log('Fetching contacts with filters:', {
        page, 
        pageSize, 
        search: debouncedSearch,
        salesperson: selectedSalesperson,
        region: selectedRegion,
        status: selectedStatus
      });
      
      let query = supabase
        .from('contacts')
        .select(`
          *,
          contact_tag_assignments(
            contact_tags(
              id,
              name,
              color,
              description
            )
          )
        `)
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      // Apply search filter with proper null-safe handling
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase().trim();
        // Use individual field searches with ilike and combine with OR
        query = query.or(
          `first_name.ilike.%${searchTerm}%,` +
          `last_name.ilike.%${searchTerm}%,` +
          `account.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `position.ilike.%${searchTerm}%`
        );
      }

      // Apply server-side filters
      if (selectedSalesperson !== 'all' && selectedSalesperson !== 'none') {
        query = query.eq('salesperson', selectedSalesperson);
      } else if (selectedSalesperson === 'none') {
        query = query.or('salesperson.is.null,salesperson.eq.');
      }

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get salesperson names by fetching profiles separately
      const salespersonCodes = [...new Set((data || []).map((contact: any) => contact.salesperson).filter(Boolean))];
      
      let salespersonNames: Record<string, string> = {};
      if (salespersonCodes.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('spp_code, full_name')
          .in('spp_code', salespersonCodes);
        
        if (!profilesError && profilesData) {
          salespersonNames = profilesData.reduce((acc, profile) => {
            if (profile.spp_code) {
              acc[profile.spp_code] = profile.full_name || '';
            }
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Transform the data to include tags and salesperson name
      const contactsWithTags = (data || []).map((contact: any) => ({
        ...contact,
        tags: contact.contact_tag_assignments?.map((assignment: any) => assignment.contact_tags) || [],
        salesperson_name: contact.salesperson ? salespersonNames[contact.salesperson] || null : null
      }));

      return contactsWithTags;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle errors
  if (error) {
    console.error('Error fetching contacts:', error);
    toast({
      title: "Error",
      description: "Failed to load contacts. Please try again.",
      variant: "destructive",
    });
  }

  return { 
    contacts: data || [], 
    loading: isLoading,
    error,
    refetch
  };
}

// Hook for getting filtered contacts count (for pagination)
export function useContactsCount(
  searchQuery: string,
  selectedSalesperson: string = 'all',
  selectedRegion: string = 'all',
  selectedStatus: string = 'all'
) {
  const debouncedSearch = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: ['contacts-count', debouncedSearch, selectedSalesperson, selectedRegion, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      // Apply search filter with proper null-safe handling
      if (debouncedSearch) {
        const searchTerm = debouncedSearch.toLowerCase().trim();
        // Use the same search logic as the main query
        query = query.or(
          `first_name.ilike.%${searchTerm}%,` +
          `last_name.ilike.%${searchTerm}%,` +
          `account.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `position.ilike.%${searchTerm}%`
        );
      }

      // Apply server-side filters
      if (selectedSalesperson !== 'all' && selectedSalesperson !== 'none') {
        query = query.eq('salesperson', selectedSalesperson);
      } else if (selectedSalesperson === 'none') {
        query = query.or('salesperson.is.null,salesperson.eq.');
      }

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
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
