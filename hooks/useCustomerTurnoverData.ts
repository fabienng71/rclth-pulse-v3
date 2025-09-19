
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, format, parse, eachMonthOfInterval } from 'date-fns';

export interface CustomerMonthlyTurnover {
  year_month: string;
  month_display: string; // Formatted for display
  total_amount: number;
  total_quantity: number;
  customer_code: string;
  customer_name: string;
  search_name: string | null; // Added search_name field
  transaction_type?: string; // Add transaction_type field to identify sales vs credit memos
}

// Adjusted to a more reasonable batch size that won't overload the database
const MAX_CUSTOMERS_PER_BATCH = 30;

export const useCustomerTurnoverData = (
  selectedCustomerCodes: string[],
  fromDate: Date,
  toDate: Date,
  includeCredits: boolean = true
) => {
  const [monthlyData, setMonthlyData] = useState<CustomerMonthlyTurnover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTurnoverData = async () => {
      if (!selectedCustomerCodes.length) {
        setMonthlyData([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Format dates for the query
        // Ensure we use start of month for fromDate and end of month for toDate
        const fromDateStr = startOfMonth(fromDate).toISOString();
        const toDateStr = endOfMonth(toDate).toISOString();
        
        console.log(`Fetching customer turnover from ${fromDateStr} to ${toDateStr}`);
        console.log(`Include credits: ${includeCredits}`);
        console.log(`Selected customers: ${selectedCustomerCodes.length}`, selectedCustomerCodes);

        // Generate all months in the date range
        const allMonths = eachMonthOfInterval({
          start: startOfMonth(fromDate),
          end: endOfMonth(toDate)
        }).map(date => format(date, 'yyyy-MM'));

        console.log(`Generated ${allMonths.length} months in date range:`, allMonths);
        
        let processedData: CustomerMonthlyTurnover[] = [];

        // Try to fetch all customers at once first if the number is reasonable
        if (selectedCustomerCodes.length <= MAX_CUSTOMERS_PER_BATCH) {
          console.log(`Processing ${selectedCustomerCodes.length} customers in a single batch`);
          try {
            processedData = await fetchCustomerBatch(selectedCustomerCodes, fromDateStr, toDateStr, allMonths, includeCredits);
            console.log(`Single batch returned ${processedData.length} records`);
          } catch (batchError) {
            console.error('Error processing batch:', batchError);
            // If single batch fails, fall back to smaller batches
            processedData = await fetchInBatches(selectedCustomerCodes, fromDateStr, toDateStr, allMonths, includeCredits);
          }
        } else {
          // Process customers in batches
          processedData = await fetchInBatches(selectedCustomerCodes, fromDateStr, toDateStr, allMonths, includeCredits);
        }
        
        // Sort the final result by customer name and month
        const result = processedData.sort(
          (a, b) => a.customer_name.localeCompare(b.customer_name) || 
                    a.year_month.localeCompare(b.year_month)
        );

        console.log(`Generated ${result.length} customer-month records for display`);
        setMonthlyData(result);
      } catch (err) {
        console.error('Error fetching customer turnover data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch turnover data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurnoverData();
  }, [selectedCustomerCodes, fromDate, toDate, includeCredits]);

  // Helper function to fetch data in batches
  const fetchInBatches = async (
    customerCodes: string[],
    fromDateStr: string,
    toDateStr: string,
    allMonths: string[],
    includeCredits: boolean
  ): Promise<CustomerMonthlyTurnover[]> => {
    console.log(`Processing ${customerCodes.length} customers in batches of ${MAX_CUSTOMERS_PER_BATCH}`);
    
    // Split customers into batches
    const batches = [];
    for (let i = 0; i < customerCodes.length; i += MAX_CUSTOMERS_PER_BATCH) {
      batches.push(customerCodes.slice(i, i + MAX_CUSTOMERS_PER_BATCH));
    }
    
    let processedData: CustomerMonthlyTurnover[] = [];
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      console.log(`Processing batch ${i+1}/${batches.length} with ${batches[i].length} customers`);
      try {
        const batchData = await fetchCustomerBatch(batches[i], fromDateStr, toDateStr, allMonths, includeCredits);
        processedData = [...processedData, ...batchData];
        console.log(`Batch ${i+1} returned ${batchData.length} records`);
        
        // Add a small delay between batches to prevent overwhelming the database
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (batchError) {
        console.error(`Error processing batch ${i+1}:`, batchError);
        // Continue with next batch instead of failing entire operation
      }
    }
    
    return processedData;
  };

  // Helper function to fetch and process data for a batch of customers
  const fetchCustomerBatch = async (
    customerCodes: string[],
    fromDateStr: string,
    toDateStr: string,
    allMonths: string[],
    includeCredits: boolean
  ): Promise<CustomerMonthlyTurnover[]> => {
    console.log(`Querying database for ${customerCodes.length} customers`);

    // Use Supabase function to get turnover data for better performance
    const { data: turnoverData, error: functionError } = await supabase
      .rpc('get_customer_turnover_data', { 
        customer_codes: customerCodes,
        from_date: fromDateStr,
        to_date: toDateStr,
        include_credits: includeCredits
      });
    
    if (functionError) {
      console.error('Database function error:', functionError);
      
      // Fall back to direct query if the function fails
      return fetchCustomerBatchDirect(customerCodes, fromDateStr, toDateStr, allMonths, includeCredits);
    }
    
    console.log(`Received ${turnoverData?.length || 0} turnover records from database function`);
    
    if (!turnoverData || turnoverData.length === 0) {
      console.warn(`No turnover data found for customers: ${customerCodes.join(', ')}`);
      
      // Fall back to direct query which might be more reliable in some cases
      return fetchCustomerBatchDirect(customerCodes, fromDateStr, toDateStr, allMonths, includeCredits);
    }
    
    // Process function results
    const processedData: CustomerMonthlyTurnover[] = [];
    
    // Create a map for quick lookup of customer info
    const customerInfoMap = new Map<string, { name: string, search_name: string | null }>();
    
    // Process turnover data to gather customer information
    turnoverData.forEach(record => {
      if (!record.customer_code) return;
      customerInfoMap.set(record.customer_code, {
        name: record.customer_name || record.customer_code,
        search_name: record.search_name || null
      });
    });
    
    // Fetch any missing customer info from the database
    for (const customerCode of customerCodes) {
      if (!customerInfoMap.has(customerCode)) {
        // Try to get customer info from database
        const { data: customerInfo } = await supabase
          .from('customers')
          .select('customer_name, search_name')
          .eq('customer_code', customerCode)
          .single();
          
        if (customerInfo) {
          customerInfoMap.set(customerCode, {
            name: customerInfo.customer_name || customerCode,
            search_name: customerInfo.search_name || null
          });
        } else {
          // Use code as name if no info available
          customerInfoMap.set(customerCode, {
            name: customerCode,
            search_name: null
          });
        }
      }
    }

    // Create a data map to aggregate transactions by customer and month
    const dataByCustomerAndMonth = new Map<string, Map<string, CustomerMonthlyTurnover>>();
    
    // Initialize the data structure for all customers and months
    customerCodes.forEach(customerCode => {
      const customerInfo = customerInfoMap.get(customerCode) || { name: customerCode, search_name: null };
      const customerMap = new Map<string, CustomerMonthlyTurnover>();
      dataByCustomerAndMonth.set(customerCode, customerMap);
      
      // Initialize with zero data for all months
      allMonths.forEach(month => {
        const date = parse(month, 'yyyy-MM', new Date());
        const monthDisplay = format(date, 'MMMM yyyy');
        
        customerMap.set(month, {
          customer_code: customerCode,
          customer_name: customerInfo.name,
          search_name: customerInfo.search_name,
          year_month: month,
          month_display: monthDisplay,
          total_amount: 0,
          total_quantity: 0
        });
      });
    });
    
    // Process turnover data and update the map
    turnoverData.forEach(record => {
      if (!record.customer_code || !record.year_month) return;
      
      const customerMap = dataByCustomerAndMonth.get(record.customer_code);
      if (!customerMap) return;
      
      const existingRecord = customerMap.get(record.year_month);
      if (existingRecord) {
        // Skip credit memos if they shouldn't be included
        if (!includeCredits && record.transaction_type === 'credit_memo') {
          return;
        }
        
        // Update existing record with this transaction's data
        existingRecord.total_amount += (record.total_amount || 0);
        existingRecord.total_quantity += (record.total_quantity || 0);
        
        // If this is the first real data for this customer-month, make sure customer info is complete
        if (existingRecord.total_amount === record.total_amount) {
          existingRecord.customer_name = record.customer_name || existingRecord.customer_name;
          existingRecord.search_name = record.search_name || existingRecord.search_name;
        }
      }
    });
    
    // Convert the nested map to flat array
    dataByCustomerAndMonth.forEach(customerMap => {
      customerMap.forEach(record => {
        processedData.push(record);
      });
    });
    
    return processedData;
  };

  // Direct query method as fallback
  const fetchCustomerBatchDirect = async (
    customerCodes: string[],
    fromDateStr: string,
    toDateStr: string,
    allMonths: string[],
    includeCredits: boolean
  ): Promise<CustomerMonthlyTurnover[]> => {
    console.log(`Performing direct query for ${customerCodes.length} customers`);

    // Query consolidated_sales directly to handle credit memos correctly
    const { data: salesData, error: salesError } = await supabase
      .from('consolidated_sales')
      .select('customer_code, customer_name, search_name, posting_date, amount, quantity, transaction_type')
      .in('customer_code', customerCodes)
      .gte('posting_date', fromDateStr)
      .lte('posting_date', toDateStr);

    if (salesError) {
      console.error('Database query error:', salesError);
      throw salesError;
    }

    console.log(`Received ${salesData?.length || 0} sales records from database`);
    
    if (!salesData || salesData.length === 0) {
      console.warn(`No sales data found for customers: ${customerCodes.join(', ')}`);
    }
    
    // Create a customer info lookup for all requested customers
    const customerInfo: Record<string, { name: string, search_name: string | null }> = {};
    
    // Pre-populate with data from salesData
    salesData?.forEach(sale => {
      if (!customerInfo[sale.customer_code]) {
        customerInfo[sale.customer_code] = {
          name: sale.customer_name || sale.customer_code,
          search_name: sale.search_name || sale.customer_name || sale.customer_code,
        };
      }
    });
    
    // For customers with no sales in this period, try to get their info
    const missingCustomers = customerCodes.filter(code => !customerInfo[code]);
    
    if (missingCustomers.length > 0) {
      console.log(`Fetching info for ${missingCustomers.length} customers with no sales in the period`);
      
      const { data: additionalCustomerData, error: customerError } = await supabase
        .from('customers')
        .select('customer_code, customer_name, search_name')
        .in('customer_code', missingCustomers);
        
      if (customerError) {
        console.warn('Error fetching additional customer info:', customerError);
      } else if (additionalCustomerData) {
        additionalCustomerData.forEach(customer => {
          customerInfo[customer.customer_code] = {
            name: customer.customer_name || customer.customer_code,
            search_name: customer.search_name || customer.customer_name || customer.customer_code
          };
        });
      }
    }
    
    // Make sure we have info for all customers, even if we couldn't find it in the database
    customerCodes.forEach(code => {
      if (!customerInfo[code]) {
        console.warn(`No customer info found for code: ${code}, using code as name`);
        customerInfo[code] = {
          name: code,
          search_name: code
        };
      }
    });

    // Create a data map to aggregate transactions by customer and month
    const dataByCustomerAndMonth = new Map<string, Map<string, CustomerMonthlyTurnover>>();
    
    // Initialize the data structure for all customers and months
    customerCodes.forEach(customerCode => {
      const customer = customerInfo[customerCode];
      const customerMap = new Map<string, CustomerMonthlyTurnover>();
      dataByCustomerAndMonth.set(customerCode, customerMap);
      
      // Initialize with zero data for all months
      allMonths.forEach(month => {
        const date = parse(month, 'yyyy-MM', new Date());
        const monthDisplay = format(date, 'MMMM yyyy');
        
        customerMap.set(month, {
          customer_code: customerCode,
          customer_name: customer.name,
          search_name: customer.search_name,
          year_month: month,
          month_display: monthDisplay,
          total_amount: 0,
          total_quantity: 0
        });
      });
    });
    
    // Process sales data
    salesData?.forEach(sale => {
      // Only process if we care about this transaction type
      if (!includeCredits && sale.transaction_type === 'credit_memo') {
        return;
      }
      
      const monthKey = format(new Date(sale.posting_date), 'yyyy-MM');
      const customerMap = dataByCustomerAndMonth.get(sale.customer_code);
      if (!customerMap) return;
      
      const monthRecord = customerMap.get(monthKey);
      if (monthRecord) {
        monthRecord.total_amount += (sale.amount || 0);
        monthRecord.total_quantity += (sale.quantity || 0);
      }
    });
    
    // Convert the nested map to flat array
    const result: CustomerMonthlyTurnover[] = [];
    dataByCustomerAndMonth.forEach(customerMap => {
      customerMap.forEach(record => {
        result.push(record);
      });
    });
    
    return result;
  };

  return {
    monthlyData,
    isLoading,
    error
  };
};
