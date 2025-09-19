
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Contact } from './useOptimizedContactsData';

interface UseAllFilteredContactsDataProps {
  searchQuery: string;
  selectedSalesperson: string;
  selectedRegion: string;
  selectedStatus: string;
  enabled: boolean;
}

const BATCH_SIZE = 1000;

export function useAllFilteredContactsData({
  searchQuery,
  selectedSalesperson,
  selectedRegion,
  selectedStatus,
  enabled
}: UseAllFilteredContactsDataProps) {
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['contacts-all-filtered', searchQuery, selectedSalesperson, selectedRegion, selectedStatus],
    queryFn: async () => {
      console.log('Starting batch fetch for all filtered contacts with:', {
        searchQuery,
        selectedSalesperson,
        selectedRegion,
        selectedStatus
      });
      
      let allContacts: Contact[] = [];
      let currentPage = 0;
      let hasMore = true;

      while (hasMore) {
        console.log(`Fetching batch ${currentPage + 1}...`);
        
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
          .range(currentPage * BATCH_SIZE, (currentPage + 1) * BATCH_SIZE - 1)
          .order('created_at', { ascending: false });

        // Apply search filter
        if (searchQuery) {
          const searchTerm = searchQuery.toLowerCase().trim();
          query = query.or(
            `first_name.ilike.%${searchTerm}%,` +
            `last_name.ilike.%${searchTerm}%,` +
            `account.ilike.%${searchTerm}%,` +
            `email.ilike.%${searchTerm}%,` +
            `position.ilike.%${searchTerm}%`
          );
        }

        // Apply salesperson filter
        if (selectedSalesperson !== 'all') {
          query = query.eq('salesperson', selectedSalesperson);
        }

        // Apply region filter
        if (selectedRegion !== 'all') {
          query = query.eq('region', selectedRegion);
        }

        // Apply status filter
        if (selectedStatus !== 'all') {
          query = query.eq('status', selectedStatus);
        }

        const { data: batchData, error: batchError } = await query;

        if (batchError) throw batchError;

        // Transform the data to include tags
        const contactsWithTags = (batchData || []).map(contact => ({
          ...contact,
          tags: contact.contact_tag_assignments?.map((assignment: any) => assignment.contact_tags) || []
        }));

        allContacts = [...allContacts, ...contactsWithTags];

        // Check if we got fewer results than the batch size, meaning we've reached the end
        hasMore = batchData && batchData.length === BATCH_SIZE;
        currentPage++;

        console.log(`Batch ${currentPage} completed. Got ${batchData?.length || 0} contacts. Total so far: ${allContacts.length}`);
      }

      console.log(`Batch fetching completed. Total contacts retrieved: ${allContacts.length}`);
      return allContacts as Contact[];
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Handle errors
  if (error) {
    console.error('Error fetching all filtered contacts:', error);
    toast({
      title: "Error",
      description: "Failed to load all contacts. Please try again.",
      variant: "destructive",
    });
  }

  return { 
    contacts: data || [], 
    loading: isLoading,
    error
  };
}
