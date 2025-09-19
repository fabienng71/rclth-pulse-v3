
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyConsumptionData {
  item_code: string;
  monthly_consumption: number;
  days_of_stock: number;
  stock_status: 'critical' | 'low' | 'normal' | 'unknown';
}

export const useMonthlyConsumption = (itemCodes: string[]) => {
  return useQuery({
    queryKey: ['monthlyConsumption', itemCodes],
    queryFn: async () => {
      if (itemCodes.length === 0) return [];

      console.log(`Fetching monthly consumption for ${itemCodes.length} items`);
      
      // Calculate date range for last 90 days exactly
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 90); // Exactly 90 days ago

      console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Fetch sales data for the last 90 days
      const { data: salesData, error } = await supabase
        .from('salesdata')
        .select('item_code, quantity, posting_date')
        .in('item_code', itemCodes)
        .gte('posting_date', startDate.toISOString())
        .lte('posting_date', endDate.toISOString());

      if (error) {
        console.error('Error fetching sales data:', error);
        throw error;
      }

      // Calculate monthly consumption for each item
      const consumptionMap = new Map<string, number>();

      // Group sales by item and calculate total consumption
      salesData?.forEach(sale => {
        const currentConsumption = consumptionMap.get(sale.item_code) || 0;
        consumptionMap.set(sale.item_code, currentConsumption + (sale.quantity || 0));
      });

      // Convert to monthly average (total consumption over 90 days / 3 = 30-day monthly average)
      const monthlyConsumptionData: MonthlyConsumptionData[] = itemCodes.map(itemCode => {
        const totalConsumption = consumptionMap.get(itemCode) || 0;
        const monthlyConsumption = totalConsumption / 3; // Average over 3 months (90 days ÷ 3)
        
        return {
          item_code: itemCode,
          monthly_consumption: Math.round(monthlyConsumption), // Remove decimals
          days_of_stock: 0, // Will be calculated when we have current stock
          stock_status: 'unknown' as const
        };
      });

      console.log(`Calculated monthly consumption for ${monthlyConsumptionData.length} items`);
      return monthlyConsumptionData;
    },
    enabled: itemCodes.length > 0,
  });
};
