import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions, FilterOptionsResponse } from '@/types/itemsV2';

/**
 * Hook to fetch distinct filter options from the items table
 * Used for populating category, brand, and vendor filters in Items Report v2
 */
export const useFilterOptions = (): FilterOptionsResponse => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['itemsFilterOptions'],
    queryFn: async (): Promise<FilterOptions> => {
      try {
        // Fetch distinct categories (posting_group)
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('items')
          .select('posting_group')
          .not('posting_group', 'is', null)
          .not('posting_group', 'eq', '');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
        }

        // Fetch distinct brands
        const { data: brandsData, error: brandsError } = await supabase
          .from('items')
          .select('brand')
          .not('brand', 'is', null)
          .not('brand', 'eq', '');

        if (brandsError) {
          console.error('Error fetching brands:', brandsError);
        }

        // Fetch distinct vendors
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('items')
          .select('vendor_code')
          .not('vendor_code', 'is', null)
          .not('vendor_code', 'eq', '');

        if (vendorsError) {
          console.error('Error fetching vendors:', vendorsError);
        }

        // Extract unique values and filter out nulls/empties
        const categories = Array.from(
          new Set(
            (categoriesData || [])
              .map(item => item.posting_group)
              .filter(Boolean)
              .sort()
          )
        );

        const brands = Array.from(
          new Set(
            (brandsData || [])
              .map(item => item.brand)
              .filter(Boolean)
              .sort()
          )
        );

        const vendors = Array.from(
          new Set(
            (vendorsData || [])
              .map(item => item.vendor_code)
              .filter(Boolean)
              .sort()
          )
        );

        return {
          categories,
          brands,
          vendors
        };

      } catch (error) {
        console.error('Error fetching filter options:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - filter options don't change frequently
    retry: 2,
  });

  return {
    data: data || { categories: [], brands: [], vendors: [] },
    isLoading,
    error: error as Error | null,
    refetch,
  };
};