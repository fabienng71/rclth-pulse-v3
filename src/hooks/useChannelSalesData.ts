
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchAdminChannelData, fetchSalespersonData } from './channel-sales/fetchChannelSalesData';
import { processRawData } from './channel-sales/dataProcessor';
import { ChannelData } from './channel-sales/types';

// Re-export the ChannelData type for consumers of this hook
export type { ChannelData } from './channel-sales/types';

export const useChannelSalesData = (fromDate: Date, toDate: Date, selectedChannel: string | null) => {
  const { profile, isAdmin } = useAuthStore();
  
  return useQuery({
    queryKey: ['channelSales', fromDate.toISOString(), toDate.toISOString(), selectedChannel, isAdmin, profile?.spp_code],
    queryFn: async () => {
      console.log('Fetching channel sales data:', {
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString(),
        selectedChannel,
        isAdmin,
        userSppCode: profile?.spp_code
      });

      // Format dates properly for the database
      const fromDateStr = fromDate.toISOString();
      const toDateStr = toDate.toISOString();
      
      let salesData = [];
      
      try {
        // Apply salesperson filter if user is not an admin and has an SPP code
        if (!isAdmin && profile?.spp_code) {
          console.log('Fetching sales data for specific salesperson:', profile.spp_code);
          salesData = await fetchSalespersonData(fromDateStr, toDateStr, profile.spp_code);
          console.log(`Total records fetched for salesperson ${profile.spp_code}: ${salesData.length}`);
        } else {
          // For admin users, fetch all data with filters as needed
          const salespersonFilter = (!isAdmin || (isAdmin && profile?.spp_code && profile.spp_code !== 'all')) 
            ? profile?.spp_code 
            : null;
            
          console.log('Admin or all data: Using consolidated_sales table', { 
            salespersonFilter,
            selectedChannel
          });
          
          salesData = await fetchAdminChannelData(fromDateStr, toDateStr, selectedChannel, salespersonFilter);
          console.log(`Total records fetched: ${salesData.length}`);
        }
        
        if (!salesData || salesData.length === 0) {
          console.log('No channel sales data found for the selected range and filters');
          // Still process the empty data to ensure all months are represented
          return processRawData([], fromDate, toDate);
        }
        
        const result = await processRawData(salesData, fromDate, toDate);
        console.log('Processed result:', {
          channels: result.channelSalesData.length,
          months: result.months.length,
          totalSales: result.channelSalesData.reduce((sum, ch) => sum + ch.total, 0)
        });
        
        return result;
      } catch (error) {
        console.error('Error in useChannelSalesData:', error);
        throw error;
      }
    }
  });
};
