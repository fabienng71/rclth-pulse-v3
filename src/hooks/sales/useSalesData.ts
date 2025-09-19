
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SalesDataItem } from '@/types/sales';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook to fetch sales data for specific items within a date range
 * Uses batched queries to avoid 1000 record limit
 */
export function useSalesData(
  itemCodes: string[],
  fromDate: Date,
  toDate: Date
) {
  const [salesData, setSalesData] = useState<SalesDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { profile, isAdmin } = useAuthStore();

  useEffect(() => {
    const fetchSalesData = async () => {
      if (itemCodes.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching sales data for items from ${fromDate.toISOString()} to ${toDate.toISOString()}`);
        
        // Batch size for queries to avoid the 1000 record limit
        const BATCH_SIZE = 500;
        let allData: SalesDataItem[] = [];
        
        // Process itemCodes in batches to avoid too many parameters in the query
        const itemCodeBatches: string[][] = [];
        for (let i = 0; i < itemCodes.length; i += BATCH_SIZE) {
          itemCodeBatches.push(itemCodes.slice(i, i + BATCH_SIZE));
        }
        
        for (const itemBatch of itemCodeBatches) {
          let hasMoreData = true;
          let lastProcessedDate = fromDate;
          
          while (hasMoreData) {
            let query = supabase
              .from('salesdata')
              .select(`
                item_code,
                description,
                base_unit_code,
                posting_date,
                quantity,
                amount
              `)
              .in('item_code', itemBatch)
              .gte('posting_date', lastProcessedDate.toISOString())
              .lte('posting_date', toDate.toISOString())
              .order('posting_date', { ascending: true })
              .limit(BATCH_SIZE);
              
            // Filter by salesperson_code if user is not an admin and has an SPP code
            if (!isAdmin && profile?.spp_code) {
              query = query.eq('salesperson_code', profile.spp_code);
            }
            
            const { data: batchData, error: fetchError } = await query;
              
            if (fetchError) throw new Error(fetchError.message);
            
            if (batchData && batchData.length > 0) {
              console.log(`Received ${batchData.length} sales records in batch`);
              
              // Update last processed date for next query
              const lastRecord = batchData[batchData.length - 1];
              if (lastRecord && lastRecord.posting_date) {
                // Add a tiny amount of time to ensure we don't get the same record again
                lastProcessedDate = new Date(new Date(lastRecord.posting_date).getTime() + 1);
              }
              
              // Add batch data to the overall result
              allData = [...allData, ...batchData];
              
              // If we got fewer records than the batch size, we've reached the end
              if (batchData.length < BATCH_SIZE) {
                hasMoreData = false;
              }
            } else {
              // No more data to fetch
              hasMoreData = false;
            }
          }
        }
        
        console.log(`Received total of ${allData.length} sales records from database`);
        
        // Explicitly type data as SalesDataItem[]
        setSalesData(allData as SalesDataItem[]);
      } catch (err: any) {
        setError(err);
        console.error('Error fetching sales data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalesData();
  }, [itemCodes, fromDate, toDate, isAdmin, profile?.spp_code]);

  return { salesData, isLoading, error };
}
