
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CogsHistoryItem {
  item_code: string;
  description: string | null;
  base_unit_code: string | null;
  year: number | null;
  month: number | null;
  cogs_unit: number | null;
  vendor_code: string | null;
  vendor_name: string | null;
}

export const useCogsHistory = (itemCode?: string, vendorFilter?: string, fromDate?: Date, toDate?: Date) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cogsHistory', itemCode, vendorFilter, fromDate, toDate],
    queryFn: async () => {
      // Prepare date filter parameters first
      const fromYear = fromDate ? fromDate.getFullYear() : undefined;
      const fromMonth = fromDate ? fromDate.getMonth() + 1 : undefined; // JS months are 0-indexed
      const toYear = toDate ? toDate.getFullYear() : undefined;
      const toMonth = toDate ? toDate.getMonth() + 1 : undefined; // JS months are 0-indexed
      
      console.log('Fetching COGS history with filters:', {
        itemCode,
        vendorFilter,
        fromDate: fromDate?.toISOString(),
        toDate: toDate?.toISOString(),
        fromYear, fromMonth, toYear, toMonth
      });
      
      // Step 1: First, fetch historical data with vendor and date filters to get all relevant item codes
      console.log('Step 1: Fetching historical data to discover item codes...');
      
      let discoveryQuery = supabase
        .from('cogs')
        .select('item_code, vendor_code')
        .order('item_code');
      
      // Apply specific item code filter if provided
      if (itemCode) {
        discoveryQuery = discoveryQuery.eq('item_code', itemCode);
      }
      
      // Apply vendor filter to historical data (not master)
      if (vendorFilter && vendorFilter !== 'all') {
        discoveryQuery = discoveryQuery.eq('vendor_code', vendorFilter);
      }
      
      // Apply basic year filtering for discovery
      if (fromYear !== undefined) {
        discoveryQuery = discoveryQuery.gte('year', fromYear);
      }
      if (toYear !== undefined) {
        discoveryQuery = discoveryQuery.lte('year', toYear);
      }
      
      const { data: discoveryData, error: discoveryError } = await discoveryQuery;
      
      if (discoveryError) {
        console.error('Error discovering item codes:', discoveryError);
        throw new Error('Failed to discover item codes');
      }
      
      if (!discoveryData || discoveryData.length === 0) {
        console.log('No historical data found for the selected filters');
        return [];
      }

      // Get unique item codes from discovery
      const itemCodes = [...new Set(discoveryData.map(item => item.item_code))];
      console.log(`Step 2: Discovered ${itemCodes.length} unique item codes for vendor ${vendorFilter}`);
      
      // Step 2: Fetch master data for the discovered item codes (no vendor filter on master)
      const { data: masterData, error: masterError } = await supabase
        .from('cogs_master')
        .select('item_code, description, base_unit_code, vendor_code')
        .in('item_code', itemCodes);
      
      if (masterError) {
        console.error('Error fetching master COGS data:', masterError);
        throw new Error('Failed to fetch master COGS data');
      }
      
      // Step 3: Now fetch detailed historical data for the discovered item codes
      console.log('Step 3: Fetching detailed historical data...');
      
      // Implement pagination to get all data in batches
      let allHistoryData: any[] = [];
      let hasMore = true;
      let page = 0;
      const pageSize = 500; // Fetch 500 records at a time
      
      while (hasMore) {
        // Build the historical query with vendor filtering applied here
        let historyQuery = supabase
          .from('cogs')
          .select('item_code, year, month, cogs_unit, vendor_code, vendor_name')
          .in('item_code', itemCodes)
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        // Apply vendor filter to historical data (key fix!)
        if (vendorFilter && vendorFilter !== 'all') {
          historyQuery = historyQuery.eq('vendor_code', vendorFilter);
        }
        
        // Apply year-level date filtering (client-side month filtering applied later)
        if (fromYear !== undefined) {
          historyQuery = historyQuery.gte('year', fromYear);
        }
        if (toYear !== undefined) {
          historyQuery = historyQuery.lte('year', toYear);
        }
        
        const { data: batchData, error: historyError } = await historyQuery;
        
        if (historyError) {
          console.error('Error fetching COGS history batch:', historyError);
          throw new Error('Failed to fetch COGS history');
        }
        
        // Add the batch to our collection
        if (batchData && batchData.length > 0) {
          allHistoryData = [...allHistoryData, ...batchData];
          // If we got fewer records than the page size, we've reached the end
          hasMore = batchData.length === pageSize;
          page++;
          
          console.log(`Fetched batch ${page} with ${batchData.length} records. Total so far: ${allHistoryData.length}`);
        } else {
          hasMore = false;
        }
      }
      
      // Get vendor data to merge with items
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('vendor_code, vendor_name');
      
      if (vendorError) {
        console.error('Error fetching vendor data:', vendorError);
        throw new Error('Failed to fetch vendor data');
      }
      
      // Create map of vendor codes to vendor names
      const vendorMap = vendorData.reduce((acc, vendor) => {
        acc[vendor.vendor_code] = vendor.vendor_name;
        return acc;
      }, {} as Record<string, string>);
      
      // Combine the data - now we work directly from historical data
      const combinedData: CogsHistoryItem[] = [];
      
      // Create a map of master data for quick lookup
      const masterMap = (masterData || []).reduce((acc, item) => {
        acc[item.item_code] = item;
        return acc;
      }, {} as Record<string, any>);
      
      // Process all historical data and enrich with master metadata
      allHistoryData.forEach(historyItem => {
        const masterItem = masterMap[historyItem.item_code];
        const vendorName = vendorMap[historyItem.vendor_code] || null;
        
        combinedData.push({
          item_code: historyItem.item_code,
          description: masterItem?.description || null,
          base_unit_code: masterItem?.base_unit_code || null,
          year: historyItem.year,
          month: historyItem.month,
          cogs_unit: historyItem.cogs_unit,
          vendor_code: historyItem.vendor_code, // Use historical vendor, not master vendor
          vendor_name: vendorName
        });
      });
      
      console.log(`Step 4: Combined ${allHistoryData.length} historical records with master metadata`);
      
      // Apply precise client-side date filtering if date range is specified
      let filteredData = combinedData;
      if (fromYear !== undefined && fromMonth !== undefined && toYear !== undefined && toMonth !== undefined) {
        console.log(`Applying client-side date filtering: ${fromYear}-${fromMonth} to ${toYear}-${toMonth}`);
        
        filteredData = combinedData.filter(item => {
          if (!item.year || !item.month) return false;
          
          const itemComposite = item.year * 100 + item.month;
          const fromComposite = fromYear * 100 + fromMonth;
          const toComposite = toYear * 100 + toMonth;
          
          return itemComposite >= fromComposite && itemComposite <= toComposite;
        });
        
        console.log(`Filtered from ${combinedData.length} to ${filteredData.length} entries based on date range`);
      }
      
      console.log(`Returning ${filteredData.length} COGS history entries after all filtering`);
      return filteredData;
    }
  });
  
  return {
    cogsHistory: data || [],
    isLoading,
    error
  };
};
