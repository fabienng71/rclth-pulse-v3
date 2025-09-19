
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { startOfMonth, endOfMonth, format } from "date-fns";

export interface SimpleChannelData {
  channel: string;
  channel_name?: string;
  months: Record<string, number>;
  total: number;
}

export interface SimpleChannelDataResult {
  channelData: SimpleChannelData[];
  months: string[];
}

export function useSimpleChannelData(fromDate: Date, toDate: Date) {
  return useQuery({
    queryKey: ['simpleChannelData', fromDate.toISOString(), toDate.toISOString()],
    queryFn: async (): Promise<SimpleChannelDataResult> => {
      // Ensure we're using the first and last day of the months
      const startDate = startOfMonth(fromDate);
      const endDate = endOfMonth(toDate);
      
      console.log(`Fetching simple channel data from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Call the new database function that directly matches the SQL query
      const { data, error } = await supabase
        .rpc('get_simple_channel_data', { 
          from_date: startDate.toISOString(),
          to_date: endDate.toISOString()
        });
      
      if (error) {
        console.error('Error fetching simple channel data:', error);
        throw error;
      }

      console.log(`Received ${data?.length || 0} rows of channel sales data`);
      
      // Get all unique months from the data
      const uniqueMonths = [...new Set(data?.map(item => item.sales_month) || [])]
        .sort((a, b) => a.localeCompare(b));
      
      console.log('Unique months:', uniqueMonths);
      
      // Get all unique channels from the data
      const uniqueChannels = [...new Set(data?.map(item => item.channel) || [])];
      console.log('Unique channels:', uniqueChannels);
      
      // Create a map of channel codes to channel names (if available)
      const channelNameMap: Record<string, string> = {};
      try {
        const { data: channelsData } = await supabase
          .from('channels')
          .select('customer_type_code, channel_name');
        
        if (channelsData) {
          channelsData.forEach(ch => {
            channelNameMap[ch.customer_type_code] = ch.channel_name;
          });
        }
      } catch (error) {
        console.warn('Could not fetch channel names:', error);
      }
      
      // Process the raw data into the required format
      const processedChannels: SimpleChannelData[] = uniqueChannels.map(channelCode => {
        // Initialize the channel data with empty months
        const channelData: SimpleChannelData = {
          channel: channelCode,
          channel_name: channelNameMap[channelCode] || channelCode,
          months: {},
          total: 0
        };
        
        // Fill in all months with 0 first
        uniqueMonths.forEach(month => {
          channelData.months[month] = 0;
        });
        
        // Then fill in the actual data
        data?.forEach(row => {
          if (row.channel === channelCode) {
            channelData.months[row.sales_month] = Number(row.total_sales);
            channelData.total += Number(row.total_sales);
          }
        });
        
        return channelData;
      });
      
      // Sort channels by total sales (descending)
      processedChannels.sort((a, b) => b.total - a.total);
      
      console.log('Processed channel data:', processedChannels);
      
      return {
        channelData: processedChannels,
        months: uniqueMonths
      };
    }
  });
}
