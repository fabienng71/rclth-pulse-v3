import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryOption {
  posting_group: string;
  description: string | null;
  item_count: number;
}

export interface BrandOption {
  brand: string;
  item_count: number;
}

export interface VendorOption {
  vendor_code: string;
  vendor_name: string | null;
  item_count: number;
}

export interface FilterOptions {
  categories: CategoryOption[];
  brands: BrandOption[];
  vendors: VendorOption[];
}

export const useItemsFilterOptions = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['itemsFilterOptions'],
    queryFn: async (): Promise<FilterOptions> => {
      // Fetch categories with item counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          posting_group,
          description
        `)
        .order('description', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
      }

      // Get item counts per category
      const { data: categoryCountsData, error: categoryCountsError } = await supabase
        .from('items')
        .select('posting_group')
        .not('posting_group', 'is', null);

      if (categoryCountsError) {
        console.error('Error fetching category counts:', categoryCountsError);
        throw new Error(`Failed to fetch category counts: ${categoryCountsError.message}`);
      }

      // Count items per category
      const categoryCounts: Record<string, number> = {};
      categoryCountsData?.forEach(item => {
        if (item.posting_group) {
          categoryCounts[item.posting_group] = (categoryCounts[item.posting_group] || 0) + 1;
        }
      });

      // Combine categories with counts
      const categories: CategoryOption[] = (categoriesData || [])
        .map(category => ({
          posting_group: category.posting_group,
          description: category.description,
          item_count: categoryCounts[category.posting_group] || 0
        }))
        .filter(category => category.item_count > 0); // Only show categories with items

      // Fetch distinct brands with counts
      const { data: brandsData, error: brandsError } = await supabase
        .rpc('get_distinct_brands_with_counts');

      if (brandsError) {
        console.error('Error fetching brands:', brandsError);
        // Fallback: get brands manually if RPC doesn't exist
        const { data: fallbackBrandsData, error: fallbackError } = await supabase
          .from('items')
          .select('brand')
          .not('brand', 'is', null)
          .not('brand', 'eq', '');

        if (fallbackError) {
          throw new Error(`Failed to fetch brands: ${fallbackError.message}`);
        }

        // Count brands manually
        const brandCounts: Record<string, number> = {};
        fallbackBrandsData?.forEach(item => {
          if (item.brand) {
            brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
          }
        });

        const brands: BrandOption[] = Object.entries(brandCounts)
          .map(([brand, count]) => ({ brand, item_count: count }))
          .sort((a, b) => a.brand.localeCompare(b.brand));

        // If RPC failed, continue with manual approach
        // Fetch vendors with item counts
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('vendors')
          .select(`
            vendor_code,
            vendor_name
          `)
          .order('vendor_name', { ascending: true });

        if (vendorsError) {
          throw new Error(`Failed to fetch vendors: ${vendorsError.message}`);
        }

        // Get item counts per vendor
        const { data: vendorCountsData, error: vendorCountsError } = await supabase
          .from('items')
          .select('vendor_code')
          .not('vendor_code', 'is', null);

        if (vendorCountsError) {
          throw new Error(`Failed to fetch vendor counts: ${vendorCountsError.message}`);
        }

        // Count items per vendor
        const vendorCounts: Record<string, number> = {};
        vendorCountsData?.forEach(item => {
          if (item.vendor_code) {
            vendorCounts[item.vendor_code] = (vendorCounts[item.vendor_code] || 0) + 1;
          }
        });

        // Combine vendors with counts
        const vendors: VendorOption[] = (vendorsData || [])
          .map(vendor => ({
            vendor_code: vendor.vendor_code,
            vendor_name: vendor.vendor_name,
            item_count: vendorCounts[vendor.vendor_code] || 0
          }))
          .filter(vendor => vendor.item_count > 0); // Only show vendors with items

        return {
          categories,
          brands,
          vendors
        };
      }

      // If RPC succeeded, use the returned data
      const brands: BrandOption[] = (brandsData || [])
        .map((item: any) => ({
          brand: item.brand,
          item_count: item.item_count
        }))
        .sort((a, b) => a.brand.localeCompare(b.brand));

      // Fetch vendors with item counts using RPC or manual approach
      const { data: vendorsRpcData, error: vendorsRpcError } = await supabase
        .rpc('get_vendors_with_item_counts');

      let vendors: VendorOption[];

      if (vendorsRpcError) {
        // Fallback to manual approach for vendors
        const { data: vendorsData, error: vendorsError } = await supabase
          .from('vendors')
          .select(`
            vendor_code,
            vendor_name
          `)
          .order('vendor_name', { ascending: true });

        if (vendorsError) {
          throw new Error(`Failed to fetch vendors: ${vendorsError.message}`);
        }

        // Get item counts per vendor
        const { data: vendorCountsData, error: vendorCountsError } = await supabase
          .from('items')
          .select('vendor_code')
          .not('vendor_code', 'is', null);

        if (vendorCountsError) {
          throw new Error(`Failed to fetch vendor counts: ${vendorCountsError.message}`);
        }

        // Count items per vendor
        const vendorCounts: Record<string, number> = {};
        vendorCountsData?.forEach(item => {
          if (item.vendor_code) {
            vendorCounts[item.vendor_code] = (vendorCounts[item.vendor_code] || 0) + 1;
          }
        });

        // Combine vendors with counts
        vendors = (vendorsData || [])
          .map(vendor => ({
            vendor_code: vendor.vendor_code,
            vendor_name: vendor.vendor_name,
            item_count: vendorCounts[vendor.vendor_code] || 0
          }))
          .filter(vendor => vendor.item_count > 0); // Only show vendors with items
      } else {
        // Use RPC result
        vendors = (vendorsRpcData || [])
          .map((item: any) => ({
            vendor_code: item.vendor_code,
            vendor_name: item.vendor_name,
            item_count: item.item_count
          }));
      }

      return {
        categories,
        brands,
        vendors
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    filterOptions: data || { categories: [], brands: [], vendors: [] },
    isLoading,
    error,
    refetch
  };
};