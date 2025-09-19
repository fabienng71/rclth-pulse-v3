
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Customer {
  customer_code: string;
  customer_name: string;
  search_name?: string | null;
  customer_type_code?: string | null;
  salesperson_code?: string | null; // Add this property
}

export const useCustomersData = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customersData'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('customer_name', { ascending: true });
        
      if (error) {
        console.error('Error fetching customers data:', error);
        throw new Error('Failed to fetch customers data');
      }

      console.log(`Retrieved ${data?.length || 0} customers from database`);      
      return (data as Customer[]) || [];
    }
  });
  
  return {
    customers: data || [],
    isLoading,
    error
  };
};

export const useCustomerSearch = (searchTerm: string) => {
  const { customers, isLoading } = useCustomersData();
  
  let results: Customer[] = [];
  
  if (searchTerm && searchTerm.length >= 2 && customers && customers.length > 0) {
    const searchTermLower = searchTerm.toLowerCase();
    
    results = customers.filter(customer => 
      (customer.customer_code && customer.customer_code.toLowerCase().includes(searchTermLower)) ||
      (customer.customer_name && customer.customer_name.toLowerCase().includes(searchTermLower)) ||
      (customer.search_name && customer.search_name.toLowerCase().includes(searchTermLower))
    );
    
    console.log('Customer search:', searchTermLower, '- Found:', results.length, 'matches');
  }
  
  return {
    results,
    isLoading
  };
};

export interface Salesperson {
  spp_code: string;
  spp_name: string;
}

export const useSalespersonsData = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['salespersonsData'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salespersons')
        .select('*')
        .order('spp_name', { ascending: true });
        
      if (error) {
        console.error('Error fetching salespersons data:', error);
        throw new Error('Failed to fetch salespersons data');
      }
      
      return (data as Salesperson[]) || [];
    }
  });
  
  return {
    salespersons: data || [],
    isLoading,
    error
  };
};
