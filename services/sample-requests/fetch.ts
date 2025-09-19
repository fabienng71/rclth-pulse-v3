
import { supabase } from '@/integrations/supabase/client';
import { SampleRequest } from './types';

/**
 * Fetches all sample requests with their items (without customer join for now)
 */
export const fetchSampleRequests = async (): Promise<SampleRequest[]> => {
  const { data, error } = await supabase
    .from('sample_requests')
    .select(`
      *,
      sample_request_items(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  console.log('Sample requests data:', data);
  
  // If we have data, fetch customer info separately for each unique customer_code
  if (data && data.length > 0) {
    const uniqueCustomerCodes = [...new Set(data.map(r => r.customer_code).filter(Boolean))];
    
    if (uniqueCustomerCodes.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('customer_code, customer_name, search_name')
        .in('customer_code', uniqueCustomerCodes);

      if (!customersError && customersData) {
        // Create a lookup map for customers
        const customerLookup = customersData.reduce((acc, customer) => {
          acc[customer.customer_code] = customer;
          return acc;
        }, {} as Record<string, any>);

        // Add customer data to sample requests
        const requestsWithCustomers = data.map(request => ({
          ...request,
          customers: customerLookup[request.customer_code] || null
        }));

        console.log('Sample requests with customer data:', requestsWithCustomers);
        return requestsWithCustomers;
      }
    }
  }
  
  return data || [];
};

/**
 * Fetches a single sample request by ID with its items and customer data
 */
export const fetchSampleRequestById = async (id: string): Promise<SampleRequest> => {
  const { data, error } = await supabase
    .from('sample_requests')
    .select(`
      *,
      sample_request_items(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  // Fetch customer data separately if we have a customer_code
  if (data && data.customer_code) {
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('customer_code, customer_name, search_name')
      .eq('customer_code', data.customer_code)
      .single();

    if (!customerError && customerData) {
      return {
        ...data,
        customers: customerData
      };
    }
  }

  return data;
};

/**
 * Fetches customer search names for given customer codes
 */
export const fetchCustomerSearchNames = async (customerCodes: string[]): Promise<Record<string, string>> => {
  if (customerCodes.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('customers')
    .select('customer_code, search_name')
    .in('customer_code', customerCodes);

  if (error) {
    console.error('Error fetching customer search names:', error);
    return {};
  }

  // Convert to a lookup object
  const searchNameLookup: Record<string, string> = {};
  data?.forEach(customer => {
    if (customer.customer_code && customer.search_name) {
      searchNameLookup[customer.customer_code] = customer.search_name;
    }
  });

  return searchNameLookup;
};
