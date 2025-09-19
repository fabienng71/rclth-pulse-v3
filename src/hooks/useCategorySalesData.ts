
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { startOfMonth, endOfMonth } from "date-fns";

export interface CategorySalesData {
  posting_group: string;
  category_name?: string;
  months: Record<string, number>;
  total: number;
  percentage: number;
}

export interface CategorySalesDataResult {
  categoryData: CategorySalesData[];
  months: string[];
}

export function useCategorySalesData(fromDate: Date, toDate: Date) {
  return useQuery({
    queryKey: ['categorySalesData', fromDate.toISOString(), toDate.toISOString()],
    queryFn: async (): Promise<CategorySalesDataResult> => {
      // Ensure we're using the first and last day of the months
      const startDate = startOfMonth(fromDate);
      const endDate = endOfMonth(toDate);
      
      console.log(`Fetching category sales data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Call the database function that directly matches the SQL query
      const { data, error } = await supabase
        .rpc('get_category_sales_data', { 
          from_date: startDate.toISOString(),
          to_date: endDate.toISOString()
        });
      
      if (error) {
        console.error('Error fetching category sales data:', error);
        throw error;
      }

      console.log(`Received ${data?.length || 0} rows of category sales data`);
      
      // Get all unique months from the data
      const uniqueMonths = [...new Set(data?.map(item => item.sales_month) || [])]
        .sort((a, b) => a.localeCompare(b));
      
      console.log('Unique months:', uniqueMonths);
      
      // Get all unique categories from the data
      const uniqueCategories = [...new Set(data?.map(item => item.posting_group) || [])];
      console.log('Unique categories:', uniqueCategories);
      
      // Create a map of category codes to category names (if available)
      const categoryNameMap: Record<string, string> = {};
      try {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('posting_group, description');
        
        if (categoriesData) {
          categoriesData.forEach(category => {
            categoryNameMap[category.posting_group] = category.description;
          });
        }
      } catch (error) {
        console.warn('Could not fetch category names:', error);
      }
      
      // Process the raw data into the required format
      const processedCategories: CategorySalesData[] = uniqueCategories.map(categoryCode => {
        // Initialize the category data with empty months
        const categoryData: CategorySalesData = {
          posting_group: categoryCode,
          category_name: categoryNameMap[categoryCode] || categoryCode,
          months: {},
          total: 0,
          percentage: 0
        };
        
        // Fill in all months with 0 first
        uniqueMonths.forEach(month => {
          categoryData.months[month] = 0;
        });
        
        // Then fill in the actual data
        data?.forEach(row => {
          if (row.posting_group === categoryCode) {
            categoryData.months[row.sales_month] = Number(row.total_sales);
            categoryData.total += Number(row.total_sales);
          }
        });
        
        return categoryData;
      });
      
      // Calculate grand total for percentage calculations
      const grandTotal = processedCategories.reduce((sum, category) => sum + category.total, 0);
      
      // Calculate percentage for each category
      processedCategories.forEach(category => {
        category.percentage = grandTotal > 0 ? (category.total / grandTotal) * 100 : 0;
      });
      
      // Sort categories by total sales (descending)
      processedCategories.sort((a, b) => b.total - a.total);
      
      console.log('Processed category data:', processedCategories);
      
      return {
        categoryData: processedCategories,
        months: uniqueMonths
      };
    }
  });
}
