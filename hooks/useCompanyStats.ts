
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompanyStats {
  totalCustomers: number;
  activeCustomers: number;
  totalTurnover: number;
  totalTransactions: number;
  averageCustomerValue: number;
}

export const useCompanyStats = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['companyStats'],
    queryFn: async (): Promise<CompanyStats> => {
      console.log('Fetching company stats from salesdata (source of truth)...');
      
      // Get stats directly from salesdata
      const { data: salesData, error: salesError } = await supabase
        .from('salesdata')
        .select('customer_code, amount, document_no')
        .not('customer_code', 'is', null)
        .not('amount', 'is', null);

      if (salesError) {
        console.error('Error fetching sales data for company stats:', salesError);
        throw new Error('Failed to fetch company statistics');
      }

      if (!salesData || salesData.length === 0) {
        return {
          totalCustomers: 0,
          activeCustomers: 0,
          totalTurnover: 0,
          totalTransactions: 0,
          averageCustomerValue: 0
        };
      }

      // Calculate stats
      const uniqueCustomers = new Set<string>();
      const uniqueDocuments = new Set<string>();
      let totalTurnover = 0;

      salesData.forEach(row => {
        if (row.customer_code) {
          uniqueCustomers.add(row.customer_code);
        }
        if (row.document_no) {
          uniqueDocuments.add(row.document_no);
        }
        totalTurnover += row.amount || 0;
      });

      const activeCustomers = uniqueCustomers.size;
      const totalTransactions = uniqueDocuments.size;

      // Get total customers from customers table (includes all customers ever seen)
      const { count: totalCustomersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      const averageCustomerValue = activeCustomers > 0 ? totalTurnover / activeCustomers : 0;

      const stats = {
        totalCustomers: totalCustomersCount || activeCustomers,
        activeCustomers,
        totalTurnover,
        totalTransactions,
        averageCustomerValue
      };

      console.log('Company stats calculated:', stats);
      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    stats: stats || {
      totalCustomers: 0,
      activeCustomers: 0,
      totalTurnover: 0,
      totalTransactions: 0,
      averageCustomerValue: 0
    },
    isLoading,
    error
  };
};
