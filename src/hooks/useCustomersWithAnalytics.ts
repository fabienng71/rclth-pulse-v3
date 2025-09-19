
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './useCustomersData';
import { useDebounce } from './useDebounce';

export interface CustomerWithAnalytics extends Customer {
  total_turnover: number;
  last_transaction_date: string | null;
  first_transaction_date: string | null;
  recent_turnover: number;
  previous_turnover: number;
  sample_requests_count: number;
  activities_count: number;
  transaction_frequency: number; // transactions per month
  average_order_value: number;
  total_transactions: number;
  trending: 'up' | 'down' | 'stable';
  channel_name: string | null;
}

interface SalesDataRow {
  customer_code: string;
  customer_name: string;
  search_name: string;
  customer_type_code: string;
  salesperson_code: string;
  amount: number;
  posting_date: string;
  document_no: string;
}

const BATCH_SIZE = 1000;

const fetchAllSalesData = async (searchTerm?: string, salespersonCode?: string): Promise<SalesDataRow[]> => {
  console.log('Starting optimized fetch of salesdata...', { searchTerm, salespersonCode });
  
  // Build base query
  let query = supabase
    .from('salesdata')
    .select('customer_code, customer_name, search_name, customer_type_code, salesperson_code, amount, posting_date, document_no')
    .not('customer_code', 'is', null)
    .not('amount', 'is', null)
    .not('posting_date', 'is', null);

  // Apply salesperson filter at query level for better performance
  if (salespersonCode && salespersonCode !== 'all') {
    query = query.eq('salesperson_code', salespersonCode);
  }

  // If we have a search term, use the original approach since results will likely be under 1000 rows
  if (searchTerm && searchTerm.trim().length >= 2) {
    console.log('Using search-optimized query for term:', searchTerm);
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    query = query.or(`customer_name.ilike.%${searchTermLower}%,search_name.ilike.%${searchTermLower}%,customer_code.ilike.%${searchTermLower}%`);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error in search query:', error);
      throw new Error('Failed to fetch customer data');
    }
    
    console.log(`Search query returned ${data?.length || 0} rows`);
    return data || [];
  }
  
  // For full data load, use batched approach
  console.log('Using batched query for full data load...');
  let allData: SalesDataRow[] = [];
  let batchNumber = 0;
  let hasMoreData = true;
  
  while (hasMoreData) {
    const startIndex = batchNumber * BATCH_SIZE;
    const endIndex = startIndex + BATCH_SIZE - 1;
    
    console.log(`Fetching batch ${batchNumber + 1}, rows ${startIndex}-${endIndex}...`);
    
    const { data, error } = await query
      .range(startIndex, endIndex)
      .order('customer_code', { ascending: true }); // Consistent ordering for reliable pagination
    
    if (error) {
      console.error(`Error fetching batch ${batchNumber + 1}:`, error);
      throw new Error(`Failed to fetch customer data batch ${batchNumber + 1}`);
    }
    
    const batchData = data || [];
    console.log(`Batch ${batchNumber + 1} returned ${batchData.length} rows`);
    
    allData = [...allData, ...batchData];
    
    // If we got fewer rows than the batch size, we've reached the end
    hasMoreData = batchData.length === BATCH_SIZE;
    batchNumber++;
    
    // Safety check to prevent infinite loops
    if (batchNumber > 100) {
      console.warn('Reached maximum batch limit, stopping...');
      break;
    }
  }
  
  console.log(`Batched fetch complete. Total rows: ${allData.length} from ${batchNumber} batches`);
  return allData;
};

export const useCustomersWithAnalytics = (searchTerm?: string, salespersonCode?: string) => {
  const debouncedSearchTerm = useDebounce(searchTerm || '', 300);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customersWithAnalytics', debouncedSearchTerm, salespersonCode],
    queryFn: async () => {
      console.log('Fetching customers with analytics from salesdata (source of truth)...', { 
        searchTerm: debouncedSearchTerm, 
        salespersonCode 
      });
      
      const salesData = await fetchAllSalesData(debouncedSearchTerm, salespersonCode);
      
      if (!salesData || salesData.length === 0) {
        console.log('No sales data found');
        return [];
      }
      
      console.log(`Processing ${salesData.length} sales records for customer analytics...`);

      // Process the data to calculate analytics for each customer
      const customerMap = new Map<string, any>();
      
      salesData.forEach(row => {
        const code = row.customer_code;
        if (!customerMap.has(code)) {
          customerMap.set(code, {
            customer_code: code,
            customer_name: row.customer_name,
            search_name: row.search_name,
            customer_type_code: row.customer_type_code,
            salesperson_code: row.salesperson_code,
            channel_name: null, // Initialize as null, will be populated from channels table
            transactions: [],
            total_turnover: 0,
            first_transaction_date: null,
            last_transaction_date: null,
            recent_turnover: 0,
            previous_turnover: 0,
            documents: new Set()
          });
        }
        
        const customer = customerMap.get(code);
        customer.transactions.push({
          amount: row.amount,
          posting_date: row.posting_date,
          document_no: row.document_no
        });
      });

      // Calculate analytics for each customer
      const processedCustomers = Array.from(customerMap.values()).map(customer => {
        const sortedTransactions = customer.transactions.sort((a: any, b: any) => 
          new Date(a.posting_date).getTime() - new Date(b.posting_date).getTime()
        );
        
        customer.total_turnover = customer.transactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        customer.first_transaction_date = sortedTransactions[0]?.posting_date || null;
        customer.last_transaction_date = sortedTransactions[sortedTransactions.length - 1]?.posting_date || null;
        
        customer.transactions.forEach((t: any) => {
          if (t.document_no) customer.documents.add(t.document_no);
        });
        
        customer.total_transactions = customer.documents.size;
        
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        customer.recent_turnover = customer.transactions
          .filter((t: any) => new Date(t.posting_date) >= sixMonthsAgo)
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
          
        customer.previous_turnover = customer.transactions
          .filter((t: any) => {
            const date = new Date(t.posting_date);
            return date >= twelveMonthsAgo && date < sixMonthsAgo;
          })
          .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
        
        customer.average_order_value = customer.total_transactions > 0 
          ? customer.total_turnover / customer.total_transactions 
          : 0;
        
        if (customer.first_transaction_date && customer.last_transaction_date && customer.total_transactions > 0) {
          const daysDiff = Math.max(1, (new Date(customer.last_transaction_date).getTime() - new Date(customer.first_transaction_date).getTime()) / (1000 * 60 * 60 * 24));
          const monthsDiff = Math.max(1, daysDiff / 30.44);
          customer.transaction_frequency = customer.total_transactions / monthsDiff;
        } else {
          customer.transaction_frequency = 0;
        }
        
        if (customer.previous_turnover > 0) {
          const change = ((customer.recent_turnover - customer.previous_turnover) / customer.previous_turnover) * 100;
          customer.trending = change > 10 ? 'up' : change < -10 ? 'down' : 'stable';
        } else if (customer.recent_turnover > 0) {
          customer.trending = 'up';
        } else {
          customer.trending = 'stable';
        }
        
        // Initialize counts to 0 for now - will be populated separately
        customer.sample_requests_count = 0;
        customer.activities_count = 0;
        
        return customer;
      });

      console.log(`Processed ${processedCustomers.length} unique customers from ${salesData.length} sales records`);

      // Get sample requests and activities count
      const customerCodes = processedCustomers.map(c => c.customer_code);
      
      if (customerCodes.length > 0) {
        console.log('Fetching sample requests and activities counts...');
        
        const { data: sampleRequestsData } = await supabase
          .from('sample_requests')
          .select('customer_code')
          .in('customer_code', customerCodes);

        const { data: activitiesData } = await supabase
          .from('activities')
          .select('customer_code')
          .in('customer_code', customerCodes);

        // Try to fetch channel information from customers table, but handle gracefully if column doesn't exist
        let customersData = null;
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('customer_code, channel_name')
            .in('customer_code', customerCodes);
          
          if (!error) {
            customersData = data;
          } else {
            console.log('Channel information not available from customers table:', error.message);
          }
        } catch (err) {
          console.log('Could not fetch channel information, likely column does not exist');
        }

        // Update counts and channel information
        processedCustomers.forEach(customer => {
          customer.sample_requests_count = sampleRequestsData?.filter(req => req.customer_code === customer.customer_code).length || 0;
          customer.activities_count = activitiesData?.filter(act => act.customer_code === customer.customer_code).length || 0;
          
          // Set channel name from customers table if available
          if (customersData) {
            const customerData = customersData.find(c => c.customer_code === customer.customer_code);
            customer.channel_name = customerData?.channel_name || null;
          } else {
            customer.channel_name = null;
          }
        });
      }

      const finalCustomers = processedCustomers.sort((a, b) => b.total_turnover - a.total_turnover);

      console.log(`Final result: ${finalCustomers.length} customers with analytics`);
      console.log(`Total turnover across all customers: $${finalCustomers.reduce((sum: number, c: any) => sum + (c.total_turnover || 0), 0).toLocaleString()}`);
      
      return finalCustomers;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !debouncedSearchTerm || debouncedSearchTerm.length >= 2 || debouncedSearchTerm.length === 0
  });
  
  return {
    customers: data || [],
    isLoading,
    error,
    refetch
  };
};
