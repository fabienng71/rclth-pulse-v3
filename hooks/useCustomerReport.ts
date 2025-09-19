
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

interface Customer {
  customer_code: string;
  customer_name: string;
  search_name: string | null;
  salesperson_code: string | null;
  total_turnover: number;
}

// Optimized data fetching function
const fetchCustomersData = async (
  selectedSalespersonCode: string,
  selectedChannelCode: string | null,
  profile: { spp_code?: string } | null,
  isAdmin: boolean
): Promise<Customer[]> => {
  console.log('Fetching customers with React Query:', {
    selectedSalespersonCode,
    selectedChannelCode,
    profile,
    isAdmin
  });
  
  // Build a single optimized query that joins customer data with turnover
  let query = supabase
    .from('customers')
    .select(`
      customer_code,
      customer_name,
      search_name,
      salesperson_code,
      consolidated_sales!inner(amount)
    `);
  
  // Apply salesperson filter
  if (!isAdmin && profile?.spp_code) {
    console.log('Applying non-admin salesperson filter:', profile.spp_code);
    query = query.eq('salesperson_code', profile.spp_code);
  } 
  else if (isAdmin && selectedSalespersonCode !== 'all') {
    console.log('Applying admin salesperson filter:', selectedSalespersonCode);
    query = query.eq('salesperson_code', selectedSalespersonCode);
  }
  
  // Apply channel filter if selected
  if (selectedChannelCode) {
    console.log('Applying channel filter:', selectedChannelCode);
    query = query.eq('customer_type_code', selectedChannelCode);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error in optimized Supabase query:', error);
    // Fallback to separate queries if join fails
    return await fetchCustomersWithFallback(selectedSalespersonCode, selectedChannelCode, profile, isAdmin);
  }
  
  console.log('Optimized customer query returned data:', { count: data?.length });
  
  if (!data) {
    return [];
  }

  // Process the joined data to calculate turnover per customer
  const customerMap = new Map<string, Customer>();
  
  data.forEach((row: any) => {
    const customerCode = row.customer_code;
    
    if (!customerMap.has(customerCode)) {
      customerMap.set(customerCode, {
        customer_code: customerCode,
        customer_name: row.customer_name,
        search_name: row.search_name,
        salesperson_code: row.salesperson_code,
        total_turnover: 0
      });
    }
    
    const customer = customerMap.get(customerCode)!;
    const amount = row.consolidated_sales?.amount || 0;
    customer.total_turnover += amount;
  });
  
  const customersWithTurnover = Array.from(customerMap.values());
  
  console.log('Processed customers with turnover (optimized):', { count: customersWithTurnover.length });
  
  return customersWithTurnover;
};

// Fallback function for when join query fails
const fetchCustomersWithFallback = async (
  selectedSalespersonCode: string,
  selectedChannelCode: string | null,
  profile: any,
  isAdmin: boolean
): Promise<Customer[]> => {
  console.log('Using fallback approach for customer data');
  
  // First fetch customer basic info
  let customerQuery = supabase
    .from('customers')
    .select('customer_code, customer_name, search_name, salesperson_code');
  
  // Apply same filters as before
  if (!isAdmin && profile?.spp_code) {
    customerQuery = customerQuery.eq('salesperson_code', profile.spp_code);
  } 
  else if (isAdmin && selectedSalespersonCode !== 'all') {
    customerQuery = customerQuery.eq('salesperson_code', selectedSalespersonCode);
  }
  
  if (selectedChannelCode) {
    customerQuery = customerQuery.eq('customer_type_code', selectedChannelCode);
  }
  
  const { data: customerData, error: customerError } = await customerQuery;
  
  if (customerError) throw customerError;
  if (!customerData) return [];
  
  // Fetch turnover data in batches to avoid too many concurrent requests
  const batchSize = 10;
  const batches = [];
  
  for (let i = 0; i < customerData.length; i += batchSize) {
    const batch = customerData.slice(i, i + batchSize);
    const customerCodes = batch.map(c => c.customer_code);
    
    const { data: salesData, error: salesError } = await supabase
      .from('consolidated_sales')
      .select('customer_code, amount')
      .in('customer_code', customerCodes);
    
    if (!salesError && salesData) {
      const turnoverMap = new Map<string, number>();
      
      salesData.forEach(sale => {
        const current = turnoverMap.get(sale.customer_code) || 0;
        turnoverMap.set(sale.customer_code, current + (sale.amount || 0));
      });
      
      const batchWithTurnover = batch.map(customer => ({
        ...customer,
        total_turnover: turnoverMap.get(customer.customer_code) || 0
      }));
      
      batches.push(...batchWithTurnover);
    } else {
      // If sales data fails, set turnover to 0
      batches.push(...batch.map(customer => ({
        ...customer,
        total_turnover: 0
      })));
    }
  }
  
  return batches;
};

export const useCustomerReport = (
  selectedSalespersonCode: string = 'all',
  selectedChannelCode: string | null = null
) => {
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { profile, isAdmin } = useAuthStore();

  // Use React Query for caching and optimized data fetching
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ['customerReport', selectedSalespersonCode, selectedChannelCode, profile?.spp_code, isAdmin],
    queryFn: () => fetchCustomersData(selectedSalespersonCode, selectedChannelCode, profile, isAdmin),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!profile, // Only fetch when profile is available
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Use cached data on mount if available
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.customer_code.toLowerCase().includes(searchTermLower) ||
        customer.customer_name.toLowerCase().includes(searchTermLower) ||
        (customer.search_name && customer.search_name.toLowerCase().includes(searchTermLower))
    );

    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  return {
    customers: filteredCustomers,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm
  };
};
