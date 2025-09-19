
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { startOfMonth, endOfMonth } from "date-fns";

export interface CategoryItemData {
  item_code: string;
  description: string;
  total_turnover: number;
  months: Record<string, number>;
  percentage: number;
}

export const useCategoryItemsData = (categoryCode: string, fromDate: Date, toDate: Date) => {
  return useQuery({
    queryKey: ['categoryItemsData', categoryCode, fromDate.toISOString(), toDate.toISOString()],
    queryFn: async (): Promise<CategoryItemData[]> => {
      console.log(`Fetching item data for category ${categoryCode} from ${fromDate.toISOString()} to ${toDate.toISOString()}`);
      
      if (!categoryCode) {
        return [];
      }

      // Ensure we're using the first and last day of the months
      const startDate = startOfMonth(fromDate);
      const endDate = endOfMonth(toDate);

      const { data, error } = await supabase
        .from('consolidated_sales')
        .select('item_code, description, amount, posting_date')
        .eq('posting_group', categoryCode)
        .gte('posting_date', startDate.toISOString())
        .lte('posting_date', endDate.toISOString());
      
      if (error) {
        console.error('Error fetching category items data:', error);
        throw error;
      }

      // Group and aggregate the data
      const itemsMap: Record<string, { 
        item_code: string, 
        description: string, 
        total_turnover: number,
        months: Record<string, number>
      }> = {};
      
      data.forEach(row => {
        const key = row.item_code;
        const postingDate = new Date(row.posting_date);
        const monthKey = `${postingDate.getFullYear()}-${String(postingDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!itemsMap[key]) {
          itemsMap[key] = {
            item_code: row.item_code,
            description: row.description,
            total_turnover: 0,
            months: {},
            percentage: 0
          };
        }
        
        if (!itemsMap[key].months[monthKey]) {
          itemsMap[key].months[monthKey] = 0;
        }
        
        itemsMap[key].months[monthKey] += Number(row.amount);
        itemsMap[key].total_turnover += Number(row.amount);
      });
      
      // Convert the map to an array
      const result = Object.values(itemsMap);
      
      // Calculate grand total for percentage calculations
      const grandTotal = result.reduce((sum, item) => sum + item.total_turnover, 0);
      
      // Calculate percentage for each item
      result.forEach(item => {
        item.percentage = grandTotal > 0 ? (item.total_turnover / grandTotal) * 100 : 0;
      });
      
      // Sort by total_turnover in descending order
      result.sort((a, b) => b.total_turnover - a.total_turnover);
      
      console.log(`Retrieved ${result.length} items for category ${categoryCode}`);
      return result;
    },
    enabled: !!categoryCode
  });
};
