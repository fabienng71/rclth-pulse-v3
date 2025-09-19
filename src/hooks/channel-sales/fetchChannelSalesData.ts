
import { supabase } from '@/lib/supabase';
import { RawSalesDataItem } from './types';

/**
 * Fetches sales data for a specific salesperson
 * @param fromDateStr ISO string of the start date
 * @param toDateStr ISO string of the end date
 * @param salesPersonCode Code of the salesperson
 * @returns Processed sales data
 */
export async function fetchSalespersonData(
  fromDateStr: string,
  toDateStr: string,
  salesPersonCode: string
): Promise<RawSalesDataItem[]> {
  let salesData: any[] = [];
  let hasMoreData = true;
  let page = 0;
  const batchSize = 500; // Fetch 500 records at a time

  try {
    while (hasMoreData) {
      console.log(`Fetching batch ${page + 1} for salesperson ${salesPersonCode} with offset ${page * batchSize}`);
      
      const { data: batchData, error: batchError } = await supabase
        .from('consolidated_sales') // Consistently use consolidated_sales
        .select('posting_date, customer_type_code, amount, id')
        .gte('posting_date', fromDateStr)
        .lte('posting_date', toDateStr)
        .eq('salesperson_code', salesPersonCode)
        .not('amount', 'is', null)
        .not('customer_type_code', 'is', null)
        .order('posting_date', { ascending: true })
        .range(page * batchSize, (page + 1) * batchSize - 1);
      
      if (batchError) {
        console.error(`Error fetching batch ${page + 1}:`, batchError);
        throw new Error(`Failed to fetch channel sales data: ${batchError.message}`);
      }
      
      if (batchData && batchData.length > 0) {
        console.log(`Received ${batchData.length} records in batch ${page + 1}`);
        salesData = [...salesData, ...batchData];
        
        // Check if we need to fetch more batches
        if (batchData.length < batchSize) {
          hasMoreData = false;
        } else {
          page++;
        }
      } else {
        hasMoreData = false;
      }
    }

    // Format data to match the expected structure
    return salesData.map(item => ({
      year_month: item.posting_date.substring(0, 7),  // Format: YYYY-MM
      channel: item.customer_type_code,
      total_sales: item.amount
    }));
  } catch (error) {
    console.error('Error in fetchSalespersonData:', error);
    throw error;
  }
}

/**
 * Fetches channel sales data for admin users
 * @param fromDateStr ISO string of the start date
 * @param toDateStr ISO string of the end date
 * @param selectedChannel Optional channel filter
 * @param salespersonCode Optional salesperson code filter
 * @returns Raw sales data
 */
export async function fetchAdminChannelData(
  fromDateStr: string,
  toDateStr: string,
  selectedChannel: string | null,
  salespersonCode?: string | null
): Promise<RawSalesDataItem[]> {
  // Using consolidated_sales table consistently
  let salesData: any[] = [];
  let hasMoreData = true;
  let page = 0;
  const batchSize = 500; // Fetch 500 records at a time
  
  try {
    while (hasMoreData) {
      console.log(`Fetching admin batch ${page + 1} with offset ${page * batchSize}`);
      console.log(`Filters: channel=${selectedChannel || 'all'}, salesperson=${salespersonCode || 'all'}`);
      
      let query = supabase
        .from('consolidated_sales') // Consistently use consolidated_sales
        .select('posting_date, customer_type_code, amount')
        .gte('posting_date', fromDateStr)
        .lte('posting_date', toDateStr)
        .not('amount', 'is', null)
        .not('customer_type_code', 'is', null);
      
      // Apply channel filter if specified
      if (selectedChannel) {
        query = query.eq('customer_type_code', selectedChannel);
      }
      
      // Apply salesperson filter if specified
      if (salespersonCode) {
        query = query.eq('salesperson_code', salespersonCode);
      }
      
      const { data: batchData, error: batchError } = await query
        .order('posting_date', { ascending: true })
        .range(page * batchSize, (page + 1) * batchSize - 1);
      
      if (batchError) {
        console.error(`Error fetching admin batch ${page + 1}:`, batchError);
        throw new Error(`Failed to fetch channel sales data: ${batchError.message}`);
      }
      
      if (batchData && batchData.length > 0) {
        console.log(`Received ${batchData.length} records in admin batch ${page + 1}`);
        salesData = [...salesData, ...batchData];
        
        // Check if we need to fetch more batches
        if (batchData.length < batchSize) {
          hasMoreData = false;
        } else {
          page++;
        }
      } else {
        hasMoreData = false;
      }
    }
    
    console.log(`Total records fetched: ${salesData.length}`);
    
    // Format data to match the expected structure
    return salesData.map(item => ({
      year_month: item.posting_date.substring(0, 7),  // Format: YYYY-MM
      channel: item.customer_type_code,
      total_sales: item.amount
    }));
  } catch (error) {
    console.error('Error in fetchAdminChannelData:', error);
    throw error;
  }
}
