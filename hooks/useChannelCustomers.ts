
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { startOfMonth, endOfMonth, format } from "date-fns";

// The customer object returned
export interface ChannelCustomer {
  customer_code: string;
  customer_name: string;
  months: Record<string, number>;
  total: number;
}

interface ChannelCustomersResult {
  data: ChannelCustomer[];
  months: string[];
  channelName?: string;
}

export function useChannelCustomers(fromDate: Date, toDate: Date, channelCode: string | undefined) {
  return useQuery({
    queryKey: ['channelCustomers', fromDate.toISOString(), toDate.toISOString(), channelCode],
    queryFn: async (): Promise<ChannelCustomersResult> => {
      if (!channelCode) {
        console.log('No channel code provided to useChannelCustomers');
        return { data: [], months: [] };
      }

      // Get the channel name for display purposes
      let channelName = channelCode; // Default to code if name not found
      const { data: channelData } = await supabase
        .from('channels')
        .select('channel_name')
        .eq('customer_type_code', channelCode)
        .single();
      
      if (channelData) {
        channelName = channelData.channel_name;
        console.log(`Resolved channel code ${channelCode} to name ${channelName}`);
      } else {
        console.warn(`Could not find channel name for code: ${channelCode}`);
      }

      console.log(`Fetching channel customers for code ${channelCode} (${channelName})`, {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
      });

      // Use the new database function instead of direct table query
      const { data, error } = await supabase
        .rpc('get_channel_customers_data', {
          from_date: startOfMonth(fromDate).toISOString(),
          to_date: endOfMonth(toDate).toISOString(),
          channel_code: channelCode
        });

      if (error) {
        console.error(`Error fetching channel customers for code ${channelCode}:`, error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} customer sales records for channel ${channelCode}`);

      // Extract all unique months from the data
      const months = [...new Set(data?.map(item => item.sales_month) || [])]
        .sort((a, b) => a.localeCompare(b));

      console.log('Unique months:', months);

      // Process the raw data into the required format - grouped by customer
      const customerMap = new Map<string, ChannelCustomer>();

      // First initialize all customers with empty month data
      data?.forEach(row => {
        const customerCode = row.customer_code || "Unknown";
        if (!customerMap.has(customerCode)) {
          const monthsObj: Record<string, number> = {};
          months.forEach(m => { monthsObj[m] = 0; });
          
          customerMap.set(customerCode, {
            customer_code: customerCode,
            customer_name: row.customer_name || customerCode,
            months: monthsObj,
            total: 0
          });
        }
      });

      // Then fill in the actual sales data
      data?.forEach(row => {
        const customerCode = row.customer_code || "Unknown";
        const month = row.sales_month;
        const amount = Number(row.total_turnover) || 0;
        
        const customer = customerMap.get(customerCode)!;
        if (months.includes(month)) {
          customer.months[month] = amount;
          customer.total += amount;
        }
      });

      // Return customers, sorted by total descending
      const customersArray = Array.from(customerMap.values()).sort(
        (a, b) => b.total - a.total
      );

      console.log(`Processed ${customersArray.length} customers for channel ${channelCode}`);

      return { 
        data: customersArray, 
        months,
        channelName
      };
    }
  });
}
