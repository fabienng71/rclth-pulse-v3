
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface CogsItem {
  id: string;
  item_code: string;
  description: string | null;
  base_unit_code: string | null;
  posting_group: string | null;
  unit_cost: number | null;
  unit_price: number | null;
  cogs_unit: number | null;
  margin: number | null;
  vendor_code: string | null;
}

export const useCogsData = (vendorFilter?: string) => {
  const { isAdmin } = useAuthStore();
  
  // Fetch COGS data
  const { data, isLoading, error } = useQuery({
    queryKey: ['cogsData', isAdmin, vendorFilter],
    queryFn: async () => {
      // Only allow admin users to access COGS data
      if (!isAdmin) {
        throw new Error('Access denied: Only admin users can view COGS data');
      }
      
      let query = supabase
        .from('cogs_master')
        .select('*');
        
      // Apply vendor filter if provided
      if (vendorFilter && vendorFilter !== 'all') {
        query = query.eq('vendor_code', vendorFilter);
      }
      
      const { data: cogsData, error } = await query.order('item_code', { ascending: true });
        
      if (error) {
        console.error('Error fetching COGS data:', error);
        throw new Error('Failed to fetch COGS data');
      }
      
      return cogsData as CogsItem[];
    },
    enabled: isAdmin // Only run query if user is admin
  });
  
  return {
    cogsItems: data || [],
    isLoading,
    error
  };
};
