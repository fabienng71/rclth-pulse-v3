import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDateForAPI } from '@/utils/formatters';

export interface RegionCustomerData {
  region: string;
  customer_code: string;
  customer_name: string;
  search_name: string | null;
  salesperson_code: string | null;
  year_month: string;
  monthly_turnover: number;
  total_turnover: number;
  region_total_turnover: number;
}

export interface RegionSummary {
  region: string;
  customer_count: number;
  total_turnover: number;
  avg_customer_value: number;
}

export interface RegionData {
  region: string;
  total_turnover: number;
  customer_count: number;
  customers: {
    customer_code: string;
    customer_name: string;
    search_name: string | null;
    salesperson_code: string | null;
    total_turnover: number;
    monthly_data: {
      year_month: string;
      monthly_turnover: number;
    }[];
  }[];
}

export interface RegionTurnoverResponse {
  regions: RegionData[];
  totalTurnover: number;
  totalCustomers: number;
  totalRegions: number;
}

const fetchRegionTurnoverData = async (
  fromDate: string,
  toDate: string,
  salespersonCode?: string | null
): Promise<RegionTurnoverResponse> => {
  try {
    // First, get total count to determine if batching is needed
    const { data: totalCount, error: countError } = await supabase
      .rpc('get_region_turnover_count', {
        p_from_date: fromDate,
        p_to_date: toDate,
        p_salesperson_code: salespersonCode === 'all' ? null : salespersonCode
      });

    if (countError) throw countError;

    console.log(`Total records: ${totalCount}, batching required: ${totalCount > 500}`);

    // Fetch detailed region data in batches
    const batchSize = 500;
    let allRegionData: RegionCustomerData[] = [];
    
    if (totalCount <= batchSize) {
      // Single request if data fits in one batch
      const { data: regionData, error: regionError } = await supabase
        .rpc('get_region_turnover_data', {
          p_from_date: fromDate,
          p_to_date: toDate,
          p_salesperson_code: salespersonCode === 'all' ? null : salespersonCode,
          p_limit: batchSize,
          p_offset: 0
        });

      if (regionError) throw regionError;
      allRegionData = regionData || [];
    } else {
      // Multiple batches required
      const numBatches = Math.ceil(totalCount / batchSize);
      console.log(`Fetching ${numBatches} batches...`);
      
      // Fetch batches in parallel (max 3 concurrent requests to avoid overloading)
      const maxConcurrent = 3;
      const batches: Promise<any>[] = [];
      let failedBatches = 0;
      
      for (let i = 0; i < numBatches; i++) {
        const offset = i * batchSize;
        
        const batchPromise = supabase
          .rpc('get_region_turnover_data', {
            p_from_date: fromDate,
            p_to_date: toDate,
            p_salesperson_code: salespersonCode === 'all' ? null : salespersonCode,
            p_limit: batchSize,
            p_offset: offset
          })
          .then(({ data, error }) => {
            if (error) {
              console.error(`Batch ${i + 1}/${numBatches} failed:`, error);
              failedBatches++;
              return []; // Return empty array for failed batches
            }
            console.log(`Batch ${i + 1}/${numBatches} completed (${data?.length || 0} records)`);
            return data || [];
          })
          .catch((err) => {
            console.error(`Batch ${i + 1}/${numBatches} error:`, err);
            failedBatches++;
            return []; // Return empty array for failed batches
          });
        
        batches.push(batchPromise);
        
        // Process batches in groups to limit concurrency
        if (batches.length >= maxConcurrent || i === numBatches - 1) {
          const batchResults = await Promise.all(batches);
          allRegionData = allRegionData.concat(...batchResults);
          batches.length = 0; // Clear the batch array
          
          // Add small delay between batch groups to prevent overwhelming the server
          if (i < numBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      // Log batch completion status
      if (failedBatches > 0) {
        console.warn(`⚠️ ${failedBatches}/${numBatches} batches failed. Continuing with partial data.`);
      }
    }

    console.log(`Collected ${allRegionData.length} total records`);

    // Fetch region summaries (typically small, no batching needed)
    const { data: summaryData, error: summaryError } = await supabase
      .rpc('get_region_summary', {
        p_from_date: fromDate,
        p_to_date: toDate,
        p_salesperson_code: salespersonCode === 'all' ? null : salespersonCode
      });

    if (summaryError) throw summaryError;

    // Process the data to group by region and customer
    const regionMap = new Map<string, RegionData>();
    
    if (allRegionData && Array.isArray(allRegionData)) {
      allRegionData.forEach((row: RegionCustomerData) => {
        if (!regionMap.has(row.region)) {
          regionMap.set(row.region, {
            region: row.region,
            total_turnover: row.region_total_turnover,
            customer_count: 0,
            customers: []
          });
        }

        const region = regionMap.get(row.region)!;
        
        // Find or create customer
        let customer = region.customers.find(c => c.customer_code === row.customer_code);
        if (!customer) {
          customer = {
            customer_code: row.customer_code,
            customer_name: row.customer_name,
            search_name: row.search_name,
            salesperson_code: row.salesperson_code,
            total_turnover: row.total_turnover,
            monthly_data: []
          };
          region.customers.push(customer);
        }

        // Add monthly data
        customer.monthly_data.push({
          year_month: row.year_month,
          monthly_turnover: row.monthly_turnover
        });
      });
    }

    // Update customer counts from summary data
    if (summaryData && Array.isArray(summaryData)) {
      summaryData.forEach((summary: RegionSummary) => {
        const region = regionMap.get(summary.region);
        if (region) {
          region.customer_count = summary.customer_count;
        }
      });
    }

    // Sort customers within each region by total turnover
    regionMap.forEach(region => {
      region.customers.sort((a, b) => b.total_turnover - a.total_turnover);
      // Sort monthly data for each customer
      region.customers.forEach(customer => {
        customer.monthly_data.sort((a, b) => a.year_month.localeCompare(b.year_month));
      });
    });

    const regions = Array.from(regionMap.values()).sort((a, b) => b.total_turnover - a.total_turnover);
    
    const totalTurnover = regions.reduce((sum, region) => sum + region.total_turnover, 0);
    const totalCustomers = regions.reduce((sum, region) => sum + region.customer_count, 0);
    const totalRegions = regions.length;

    return {
      regions,
      totalTurnover,
      totalCustomers,
      totalRegions
    };

  } catch (error) {
    console.error('Error fetching region turnover data:', error);
    throw error;
  }
};

export const useRegionTurnoverData = (
  fromDate?: Date,
  toDate?: Date,
  salespersonCode?: string | null
) => {
  const queryKey = [
    'regionTurnoverData', 
    fromDate ? formatDateForAPI(fromDate) : null,
    toDate ? formatDateForAPI(toDate) : null,
    salespersonCode
  ];

  return useQuery({
    queryKey,
    queryFn: () => {
      if (!fromDate || !toDate) {
        throw new Error('Date range is required');
      }
      
      return fetchRegionTurnoverData(
        formatDateForAPI(fromDate),
        formatDateForAPI(toDate),
        salespersonCode
      );
    },
    enabled: !!(fromDate && toDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};