
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LastMonthConsumptionData {
  item_code: string;
  last_month_consumption: number;
  days_of_stock: number;
  stock_status: 'critical' | 'low' | 'normal' | 'unknown';
}

export const useLastMonthConsumption = (itemCodes: string[]) => {
  return useQuery({
    queryKey: ['lastMonthConsumption', itemCodes, 'v2'], // Version key for cache busting
    queryFn: async () => {
      if (itemCodes.length === 0) return [];

      
      // Calculate last month's date range (calendar month)
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      
      // Use local date strings to avoid UTC timezone conversion issues
      const startDateStr = lastMonth.toLocaleDateString('sv-SE'); // YYYY-MM-DD format
      const endDateStr = lastMonthEnd.toLocaleDateString('sv-SE'); // YYYY-MM-DD format
      
      console.log(`[Last Month Consumption] Today: ${today.toISOString()}`);
      console.log(`[Last Month Consumption] Last month start: ${lastMonth.toISOString()} -> ${startDateStr}`);
      console.log(`[Last Month Consumption] Last month end: ${lastMonthEnd.toISOString()} -> ${endDateStr}`);
      console.log(`[Last Month Consumption] Date range: ${startDateStr} to ${endDateStr}`);

      // FIRST: Test raw query specifically for the problematic item to verify data
      const debugItem = 'IPS0WW0000551';
      console.log(`[RAW QUERY TEST] Testing raw query for ${debugItem} only...`);
      
      // Test 1: Direct item query with all fields
      const { data: rawTestData, error: rawTestError } = await supabase
        .from('salesdata')
        .select('*') // Select ALL columns to see what's available
        .eq('item_code', debugItem)
        .gte('posting_date', startDateStr)
        .lte('posting_date', endDateStr);
      
      // Test 2: Exact SQL equivalent query - this should return 172
      console.log(`[SQL EQUIVALENT TEST] Testing exact SQL equivalent...`);
      const { data: sqlEquivData, error: sqlEquivError, count } = await supabase
        .from('salesdata')
        .select('item_code, quantity', { count: 'exact' })
        .eq('item_code', debugItem)
        .gte('posting_date', startDateStr)
        .lte('posting_date', endDateStr);
      
      if (sqlEquivError) {
        console.error('[SQL EQUIVALENT TEST] Error:', sqlEquivError);
      } else {
        console.log(`[SQL EQUIVALENT TEST] Found ${count} records, data length: ${sqlEquivData?.length}`);
        if (sqlEquivData) {
          const sqlEquivTotal = sqlEquivData.reduce((sum, record) => sum + (record.quantity || 0), 0);
          console.log(`[SQL EQUIVALENT TEST] Total quantity: ${sqlEquivTotal} (should be 172)`);
          console.log(`[SQL EQUIVALENT TEST] Individual quantities:`, sqlEquivData.map(r => r.quantity));
        }
      }

      if (rawTestError) {
        console.error('[RAW QUERY TEST] Error:', rawTestError);
      } else {
        console.log(`[RAW QUERY TEST] Found ${rawTestData?.length || 0} records for ${debugItem}`);
        if (rawTestData && rawTestData.length > 0) {
          console.log('[RAW QUERY TEST] First record:', rawTestData[0]);
          console.log('[RAW QUERY TEST] All records:', rawTestData);
          const rawTotal = rawTestData.reduce((sum, record) => sum + (record.quantity || 0), 0);
          console.log(`[RAW QUERY TEST] Raw total quantity: ${rawTotal}`);
          
          // Test if there are other quantity-like fields
          const sampleRecord = rawTestData[0];
          console.log('[RAW QUERY TEST] Sample record keys:', Object.keys(sampleRecord));
          
          // Look for any field that might contain the correct quantity
          Object.keys(sampleRecord).forEach(key => {
            if (key.toLowerCase().includes('qty') || key.toLowerCase().includes('quantity') || key.toLowerCase().includes('amount')) {
              console.log(`[RAW QUERY TEST] Field ${key}:`, sampleRecord[key]);
            }
          });
        }
      }

      // SECOND: Test if the issue is with .in() filtering
      console.log(`[IN FILTER TEST] Testing .in() vs .eq() difference...`);
      console.log(`[IN FILTER TEST] Total item codes: ${itemCodes.length}`);
      console.log(`[IN FILTER TEST] First 10 item codes:`, itemCodes.slice(0, 10));
      
      // Original query for all items with count and no pagination limit
      const { data: salesData, error, count: totalCount } = await supabase
        .from('salesdata')
        .select('item_code, quantity, posting_date, amount, unit_price, document_no', { count: 'exact' })
        .in('item_code', itemCodes)
        .gte('posting_date', startDateStr)
        .lte('posting_date', endDateStr)
        .range(0, 999999); // Force no pagination limit
      
      console.log(`[PAGINATION TEST] Total records in bulk query: ${totalCount}, actual data length: ${salesData?.length || 0}`);
      if (totalCount !== (salesData?.length || 0)) {
        console.warn(`[PAGINATION WARNING] Record count mismatch! Database has ${totalCount} records but we only got ${salesData?.length || 0} records. This indicates pagination!`);
      } else {
        console.log(`[PAGINATION SUCCESS] Got all ${totalCount} records successfully!`);
      }
      
      // Calculate total consumption across all items for context
      const totalConsumption = salesData?.reduce((sum, record) => sum + (record.quantity || 0), 0) || 0;
      console.log(`[BULK QUERY SUMMARY] Total consumption across all ${itemCodes.length} items: ${totalConsumption} units from ${salesData?.length || 0} records`);
      
      // Count how many records we got for our debug item in the bulk query
      if (salesData) {
        const debugRecordsInBulk = salesData.filter(record => record.item_code === debugItem);
        console.log(`[IN FILTER TEST] Records for ${debugItem} in bulk query: ${debugRecordsInBulk.length}`);
        const bulkTotal = debugRecordsInBulk.reduce((sum, record) => sum + (record.quantity || 0), 0);
        console.log(`[IN FILTER TEST] Bulk query total for ${debugItem}: ${bulkTotal}`);
      }

      if (error) {
        console.error('Error fetching sales data:', error);
        throw error;
      }

      // Debug logging for specific problematic item (debugItem already declared above)
      const debugSalesData = salesData?.filter(sale => sale.item_code === debugItem);
      if (debugSalesData && debugSalesData.length > 0) {
        console.log(`[DEBUG] Found ${debugSalesData.length} sales records for ${debugItem}:`, debugSalesData);
        
        // Show individual quantities and their sum
        console.table(debugSalesData.map((sale, index) => ({
          index,
          posting_date: sale.posting_date,
          document_no: sale.document_no,
          quantity: sale.quantity,
          quantity_type: typeof sale.quantity,
          amount: sale.amount,
          unit_price: sale.unit_price,
          calculated_qty: sale.amount && sale.unit_price ? sale.amount / sale.unit_price : null,
          is_quantity_null: sale.quantity === null,
          is_quantity_undefined: sale.quantity === undefined
        })));
        
        const debugTotal = debugSalesData.reduce((sum, sale) => {
          const qty = sale.quantity || 0;
          console.log(`[DEBUG] Adding quantity: ${qty} (type: ${typeof qty}) to sum: ${sum}`);
          return sum + qty;
        }, 0);
        console.log(`[DEBUG] Total quantity for ${debugItem}: ${debugTotal}`);
        console.log(`[DEBUG] Expected vs Actual: Expected 172, Got ${debugTotal}, Difference: ${172 - debugTotal}`);
      } else if (itemCodes.includes(debugItem)) {
        console.log(`[DEBUG] No sales data found for ${debugItem} in date range ${startDateStr} to ${endDateStr}`);
      }

      // Calculate last month consumption for each item
      const consumptionMap = new Map<string, number>();

      // Group sales by item and calculate total consumption for last month
      salesData?.forEach(sale => {
        const currentConsumption = consumptionMap.get(sale.item_code) || 0;
        consumptionMap.set(sale.item_code, currentConsumption + (sale.quantity || 0));
      });

      // Create consumption data array
      const lastMonthConsumptionData: LastMonthConsumptionData[] = itemCodes.map(itemCode => {
        const lastMonthConsumption = consumptionMap.get(itemCode) || 0;
        
        // Additional validation for data quality
        const validatedConsumption = isNaN(lastMonthConsumption) || lastMonthConsumption < 0 ? 0 : lastMonthConsumption;
        
        // Debug logging for the specific problematic item
        if (itemCode === debugItem && validatedConsumption > 0) {
          console.log(`[DEBUG] Final consumption for ${debugItem}: ${validatedConsumption} (rounded: ${Math.round(validatedConsumption)})`);
        }
        
        return {
          item_code: itemCode,
          last_month_consumption: Math.round(validatedConsumption), // Remove decimals
          days_of_stock: 0, // Will be calculated when we have current stock
          stock_status: 'unknown' as const
        };
      });

      return lastMonthConsumptionData;
    },
    enabled: itemCodes.length > 0,
    staleTime: 0, // Always fetch fresh data for testing
    cacheTime: 0, // No caching for testing
  });
};
