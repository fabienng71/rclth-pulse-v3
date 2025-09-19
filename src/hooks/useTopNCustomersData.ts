
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Debug utility - only logs in development
const debugLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export interface TopNCustomerData {
  customer_code: string;
  customer_name: string;
  search_name: string;
  year_month: string;
  monthly_turnover: number;
  monthly_cost: number;
  monthly_margin: number;
  monthly_margin_percent: number;
  total_turnover: number;
  total_cost: number;
  total_margin: number;
  total_margin_percent: number;
  total_count?: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProcessedTopNData {
  customers: {
    customer_code: string;
    customer_name: string;
    search_name: string;
    total_turnover: number;
    total_cost: number;
    total_margin: number;
    total_margin_percent: number;
    monthly_data: { [month: string]: number };
    monthly_cost_data: { [month: string]: number };
    monthly_margin_data: { [month: string]: number };
    monthly_margin_percent_data: { [month: string]: number };
  }[];
  months: string[];
  monthlyTotals: { [month: string]: number };
  monthlyCostTotals: { [month: string]: number };
  monthlyMarginTotals: { [month: string]: number };
  grandTotal: number;
  grandCostTotal: number;
  grandMarginTotal: number;
  pagination?: PaginationInfo;
  isPartialData?: boolean;
}

export const useTopNCustomersData = (
  fromDate?: string,
  toDate?: string,
  topN?: number,
  salespersonCode?: string,
  channelCode?: string | null
) => {
  const { toast } = useToast();

  const fetchTopNData = async (): Promise<ProcessedTopNData> => {
    if (!fromDate || !toDate || !topN) {
      return {
        customers: [],
        months: [],
        monthlyTotals: {},
        grandTotal: 0,
        pagination: {
          currentPage: 1,
          pageSize: 1000,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        },
        isPartialData: false
      };
    }

    try {
      debugLog('=== Top N Data Fetch Debug ===');
      debugLog('Received dates:', { fromDate, toDate });
      debugLog('Other parameters:', { topN, salespersonCode, channelCode });

      // Validate date format (dates should already be in YYYY-MM-DD format from TopNReport)
      if (!fromDate.match(/^\d{4}-\d{2}-\d{2}$/) || !toDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error('Invalid date format. Expected YYYY-MM-DD format.');
      }

      // Validate date range
      if (new Date(fromDate) > new Date(toDate)) {
        throw new Error('From date cannot be after to date.');
      }

      // Handle the salesperson filter correctly
      const salespersonParam = salespersonCode === 'all' || !salespersonCode ? null : salespersonCode;

      // Use batch processing for large datasets
      const batchResult = await fetchDataInBatches({
        fromDate,
        toDate,
        topN,
        salespersonCode: salespersonParam,
        channelCode
      });

      if (batchResult.error) {
        console.error('Batch processing error:', batchResult.error);
        // If the function doesn't exist or there's a table reference issue, show a helpful message
        if (batchResult.error.message && (batchResult.error.message.includes('function') || batchResult.error.message.includes('relation') || batchResult.error.message.includes('table'))) {
          throw new Error('The Top N customers database function needs to be updated. Please run the latest database migration to fix table reference issues.');
        }
        throw batchResult.error;
      }

      // Type guard and validation for raw data
      const validatedRawData = Array.isArray(batchResult.data) ? batchResult.data as TopNCustomerData[] : [];

      if (!validatedRawData.length) {
        debugLog('No data returned from batch processing');
        return {
          customers: [],
          months: [],
          monthlyTotals: {},
          grandTotal: 0,
          pagination: batchResult.pagination,
          isPartialData: false
        };
      }

      debugLog(`Raw data received: ${validatedRawData.length} records`);
      debugLog('Sample records:', validatedRawData.slice(0, 3));
      
      // Validate raw data structure
      const validatedData = validatedRawData.filter(item => {
        const isValid = item && 
          typeof item.customer_code === 'string' && 
          typeof item.customer_name === 'string' &&
          typeof item.monthly_turnover === 'number' &&
          typeof item.total_turnover === 'number';
        
        if (!isValid) {
          debugLog('Invalid data record:', item);
        }
        return isValid;
      });

      if (validatedData.length !== validatedRawData.length) {
        debugLog(`Filtered out ${validatedRawData.length - validatedData.length} invalid records`);
      }

      // Process the raw data
      const processed = processTopNData(validatedData);
      
      // Add pagination info
      processed.pagination = batchResult.pagination;
      processed.isPartialData = batchResult.pagination.totalCount > validatedData.length;
      
      debugLog('Processed data summary:', {
        customerCount: processed.customers.length,
        monthCount: processed.months.length,
        grandTotal: processed.grandTotal,
        totalAvailable: batchResult.pagination.totalCount,
        isPartialData: processed.isPartialData
      });
      
      return processed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data';
      console.error('Top N data fetch error:', err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const query = useQuery({
    queryKey: ['topNCustomers', fromDate, toDate, topN, salespersonCode, channelCode],
    queryFn: fetchTopNData,
    enabled: Boolean(fromDate && toDate && topN),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    data: query.data || null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch
  };
};

// Batch data fetching function to handle large datasets
const fetchDataInBatches = async (params: {
  fromDate: string;
  toDate: string;
  topN: number;
  salespersonCode?: string | null;
  channelCode?: string | null;
}): Promise<{
  data: TopNCustomerData[];
  error: any;
  pagination: PaginationInfo;
}> => {
  const { fromDate, toDate, topN, salespersonCode, channelCode } = params;
  const batchSize = 500; // Fetch in batches of 500 rows
  
  try {
    debugLog('=== Batch Processing Started ===');
    debugLog('Batch parameters:', { fromDate, toDate, topN, salespersonCode, channelCode, batchSize });
    
    // First, get the total count of customers
    const { data: totalCount, error: countError } = await supabase
      .rpc('get_top_n_customers_count', {
        from_date: fromDate,
        to_date: toDate,
        p_salesperson_code: salespersonCode,
        p_channel_code: channelCode
      });

    if (countError) {
      debugLog('Error getting customer count:', countError);
      return {
        data: [],
        error: countError,
        pagination: {
          currentPage: 1,
          pageSize: batchSize,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }

    const actualTotalCount = totalCount || 0;
    const actualTopN = Math.min(topN, actualTotalCount);
    const totalBatches = Math.ceil(actualTopN / batchSize);
    
    debugLog(`Total customers: ${actualTotalCount}, Requested: ${topN}, Actual: ${actualTopN}, Batches: ${totalBatches}`);

    // Collect all batches
    const allData: TopNCustomerData[] = [];
    const batchPromises: Promise<TopNCustomerData[]>[] = [];

    // Create batch requests - process in parallel for better performance
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const offset = batchIndex * batchSize;
      const limit = Math.min(batchSize, actualTopN - offset);
      
      if (limit <= 0) break;

      debugLog(`Creating batch ${batchIndex + 1}/${totalBatches}: offset=${offset}, limit=${limit}`);
      
      const batchPromise = supabase
        .rpc('get_top_n_customers_by_turnover', {
          from_date: fromDate,
          to_date: toDate,
          top_n_limit: actualTopN, // Total limit for ordering
          p_salesperson_code: salespersonCode,
          p_channel_code: channelCode,
          p_offset: offset,
          p_page_size: limit
        })
        .then(({ data, error }) => {
          if (error) {
            debugLog(`Batch ${batchIndex + 1} error:`, error);
            throw error;
          }
          debugLog(`Batch ${batchIndex + 1} success: ${data?.length || 0} records`);
          return Array.isArray(data) ? data as TopNCustomerData[] : [];
        });

      batchPromises.push(batchPromise);
    }

    // Execute all batch requests in parallel
    debugLog('Executing batch requests in parallel...');
    const batchResults = await Promise.all(batchPromises);
    
    // Combine all batch results
    for (const batchData of batchResults) {
      allData.push(...batchData);
    }

    // Remove duplicates based on customer_code + year_month combination
    const uniqueData = new Map<string, TopNCustomerData>();
    allData.forEach(item => {
      const key = `${item.customer_code}_${item.year_month}`;
      if (!uniqueData.has(key)) {
        uniqueData.set(key, item);
      }
    });

    const finalData = Array.from(uniqueData.values());
    
    debugLog('Batch processing completed:', {
      totalBatches,
      rawRecords: allData.length,
      uniqueRecords: finalData.length,
      duplicatesRemoved: allData.length - finalData.length
    });

    return {
      data: finalData,
      error: null,
      pagination: {
        currentPage: 1,
        pageSize: finalData.length,
        totalCount: actualTotalCount,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };

  } catch (error) {
    debugLog('Batch processing error:', error);
    return {
      data: [],
      error: error,
      pagination: {
        currentPage: 1,
        pageSize: batchSize,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    };
  }
};

// Optimized data processing with performance improvements
const processTopNData = (rawData: TopNCustomerData[]): ProcessedTopNData => {
  if (!rawData.length) {
    debugLog('No raw data to process');
    return {
      customers: [],
      months: [],
      monthlyTotals: {},
      monthlyCostTotals: {},
      monthlyMarginTotals: {},
      grandTotal: 0,
      grandCostTotal: 0,
      grandMarginTotal: 0
    };
  }

  debugLog('Processing Top N data:', rawData.length, 'records');

  // Use Set for O(1) lookups and reduce iterations
  const monthsSet = new Set<string>();
  const customerMap = new Map<string, {
    customer_code: string;
    customer_name: string;
    search_name: string;
    total_turnover: number;
    total_cost: number;
    total_margin: number;
    total_margin_percent: number;
    monthly_data: Record<string, number>;
    monthly_cost_data: Record<string, number>;
    monthly_margin_data: Record<string, number>;
    monthly_margin_percent_data: Record<string, number>;
  }>();
  
  // Single pass through raw data for both grouping and month collection
  rawData.forEach((item, index) => {
    try {
      if (!item.customer_code) {
        debugLog(`Record ${index} missing customer_code:`, item);
        return;
      }

      // Add month to set if valid
      if (item.year_month && typeof item.year_month === 'string') {
        monthsSet.add(item.year_month);
      }

      // Get or create customer entry
      let customer = customerMap.get(item.customer_code);
      if (!customer) {
        customer = {
          customer_code: item.customer_code,
          customer_name: item.customer_name || 'Unknown Customer',
          search_name: item.search_name || item.customer_name || 'Unknown',
          total_turnover: Number(item.total_turnover) || 0,
          total_cost: Number(item.total_cost) || 0,
          total_margin: Number(item.total_margin) || 0,
          total_margin_percent: Number(item.total_margin_percent) || 0,
          monthly_data: {},
          monthly_cost_data: {},
          monthly_margin_data: {},
          monthly_margin_percent_data: {}
        };
        customerMap.set(item.customer_code, customer);
      }
      
      // Add monthly data if valid
      if (item.year_month) {
        if (typeof item.monthly_turnover === 'number') {
          customer.monthly_data[item.year_month] = Number(item.monthly_turnover);
        }
        if (typeof item.monthly_cost === 'number') {
          customer.monthly_cost_data[item.year_month] = Number(item.monthly_cost);
        }
        if (typeof item.monthly_margin === 'number') {
          customer.monthly_margin_data[item.year_month] = Number(item.monthly_margin);
        }
        if (typeof item.monthly_margin_percent === 'number') {
          customer.monthly_margin_percent_data[item.year_month] = Number(item.monthly_margin_percent);
        }
      }
    } catch (err) {
      debugLog(`Error processing record ${index}:`, err, item);
    }
  });

  // Convert set to sorted array
  const months = Array.from(monthsSet).sort();
  debugLog('Unique months found:', months);

  // Filter and sort customers
  const customers = Array.from(customerMap.values())
    .filter(customer => customer.total_turnover > 0)
    .sort((a, b) => b.total_turnover - a.total_turnover);

  debugLog('Processed customers:', customers.length);

  // Calculate monthly totals efficiently
  const monthlyTotals: Record<string, number> = {};
  const monthlyCostTotals: Record<string, number> = {};
  const monthlyMarginTotals: Record<string, number> = {};
  
  for (const month of months) {
    let monthTotal = 0;
    let monthCostTotal = 0;
    let monthMarginTotal = 0;
    
    for (const customer of customers) {
      monthTotal += customer.monthly_data[month] || 0;
      monthCostTotal += customer.monthly_cost_data[month] || 0;
      monthMarginTotal += customer.monthly_margin_data[month] || 0;
    }
    
    monthlyTotals[month] = monthTotal;
    monthlyCostTotals[month] = monthCostTotal;
    monthlyMarginTotals[month] = monthMarginTotal;
  }

  // Calculate grand totals
  const grandTotal = customers.reduce((sum, customer) => sum + customer.total_turnover, 0);
  const grandCostTotal = customers.reduce((sum, customer) => sum + customer.total_cost, 0);
  const grandMarginTotal = customers.reduce((sum, customer) => sum + customer.total_margin, 0);

  debugLog('Processing summary:', {
    customersCount: customers.length,
    monthsCount: months.length,
    grandTotal,
    grandCostTotal,
    grandMarginTotal,
    monthlyTotals,
    monthlyCostTotals,
    monthlyMarginTotals
  });

  return {
    customers,
    months,
    monthlyTotals,
    monthlyCostTotals,
    monthlyMarginTotals,
    grandTotal,
    grandCostTotal,
    grandMarginTotal
  };
};
