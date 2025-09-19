
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ItemPricingData {
  unit_price: number | null;
  cogs_unit: number | null;
  margin_percent: number | null;
}

export const useItemPricingData = (itemCode: string | null) => {
  return useQuery({
    queryKey: ['itemPricingData', itemCode],
    queryFn: async (): Promise<ItemPricingData> => {
      if (!itemCode) {
        return { unit_price: null, cogs_unit: null, margin_percent: null };
      }

      console.log('Fetching pricing data for item:', itemCode);

      // Fetch unit price from items table
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('unit_price')
        .eq('item_code', itemCode)
        .single();

      if (itemError && itemError.code !== 'PGRST116') {
        console.error('Error fetching item data:', itemError);
      }

      // Fetch COGS from cogs_master table
      const { data: cogsData, error: cogsError } = await supabase
        .from('cogs_master')
        .select('cogs_unit')
        .eq('item_code', itemCode)
        .single();

      if (cogsError && cogsError.code !== 'PGRST116') {
        console.error('Error fetching COGS data:', cogsError);
      }

      const unitPrice = itemData?.unit_price || null;
      const cogsUnit = cogsData?.cogs_unit || null;
      
      // Calculate margin percentage if both values are available
      let marginPercent = null;
      if (unitPrice && cogsUnit && unitPrice > 0) {
        marginPercent = ((unitPrice - cogsUnit) / unitPrice) * 100;
      }

      return {
        unit_price: unitPrice,
        cogs_unit: cogsUnit,
        margin_percent: marginPercent
      };
    },
    enabled: !!itemCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
