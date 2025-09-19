import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClearanceCustomerData {
  customer_code: string;
  customer_name: string;
  search_name: string;
  total_quantity: number;
  last_purchase_date: string;
  purchase_frequency: number;
}

export const useClearanceCustomerData = (itemCode: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['clearanceCustomerData', itemCode],
    queryFn: async (): Promise<ClearanceCustomerData[]> => {
      if (!itemCode) return [];

      console.log('Fetching customer data for item:', itemCode);

      // Get data from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('salesdata')
        .select(`
          customer_code,
          customer_name,
          search_name,
          quantity,
          posting_date
        `)
        .eq('item_code', itemCode)
        .gte('posting_date', sixMonthsAgo.toISOString())
        .not('customer_code', 'is', null)
        .order('posting_date', { ascending: false });

      if (error) {
        console.error('Error fetching customer data:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group by customer and aggregate data
      const customerMap = new Map<string, {
        customer_code: string;
        customer_name: string;
        search_name: string;
        total_quantity: number;
        last_purchase_date: string;
        purchase_count: number;
      }>();

      data.forEach(record => {
        const key = record.customer_code;
        if (!key) return;

        const existing = customerMap.get(key);
        if (existing) {
          existing.total_quantity += (record.quantity || 0);
          existing.purchase_count += 1;
          // Keep the most recent purchase date
          if (new Date(record.posting_date) > new Date(existing.last_purchase_date)) {
            existing.last_purchase_date = record.posting_date;
          }
        } else {
          customerMap.set(key, {
            customer_code: record.customer_code,
            customer_name: record.customer_name || '',
            search_name: record.search_name || '',
            total_quantity: record.quantity || 0,
            last_purchase_date: record.posting_date,
            purchase_count: 1
          });
        }
      });

      // Convert to array and calculate frequency
      const customers = Array.from(customerMap.values()).map(customer => ({
        customer_code: customer.customer_code,
        customer_name: customer.customer_name,
        search_name: customer.search_name,
        total_quantity: customer.total_quantity,
        last_purchase_date: customer.last_purchase_date,
        purchase_frequency: customer.purchase_count
      }));

      // Sort by most recent purchase date and limit to top 15
      const sortedCustomers = customers
        .sort((a, b) => new Date(b.last_purchase_date).getTime() - new Date(a.last_purchase_date).getTime())
        .slice(0, 15);

      console.log(`Found ${sortedCustomers.length} customers for item ${itemCode}`);
      return sortedCustomers;
    },
    enabled: enabled && !!itemCode,
  });
};
