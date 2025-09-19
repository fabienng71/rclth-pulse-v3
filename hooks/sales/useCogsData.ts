
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CogsItem } from '@/types/sales';

/**
 * Hook to fetch COGS data for specific items
 */
export function useCogsData(itemCodes: string[]) {
  const [cogsMap, setCogsMap] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCogsData = async () => {
      if (itemCodes.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: cogsError } = await supabase
          .rpc('get_cogs_data_for_items', { item_codes: itemCodes });
        
        if (cogsError) {
          console.error('Error fetching COGS data:', cogsError);
          // Continue execution, we'll use fallback values if needed
        }
        
        // Create a map of item_code to cogs_unit for quick lookups
        const newCogsMap = new Map<string, number>();
        if (data) {
          (data as CogsItem[]).forEach(item => {
            if (item.item_code && item.cogs_unit) {
              newCogsMap.set(item.item_code, item.cogs_unit);
            }
          });
        }
        
        setCogsMap(newCogsMap);
      } catch (err: any) {
        setError(err);
        console.error('Error fetching COGS data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCogsData();
  }, [itemCodes]);

  return { cogsMap, isLoading, error };
}
