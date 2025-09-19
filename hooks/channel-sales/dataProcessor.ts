
import { ChannelData, ProcessedChannelSalesData, RawSalesDataItem } from './types';
import { fetchChannelNames } from './fetchChannelNames';
import { generateAllMonthsInRange } from './dateUtils';

/**
 * Processes raw sales data into a structured format
 * @param rawSalesData Raw data from the database
 * @param fromDate Start date for the data range
 * @param toDate End date for the data range
 * @returns Processed channel sales data
 */
export async function processRawData(
  rawSalesData: RawSalesDataItem[], 
  fromDate: Date, 
  toDate: Date
): Promise<ProcessedChannelSalesData> {
  // Fetch channel names for mapping channel codes to names
  const channelNameMap = await fetchChannelNames();
  console.log('Channel name mapping:', channelNameMap);

  // Create an array of all months in the date range (inclusive)
  const allMonths = generateAllMonthsInRange(fromDate, toDate);
  console.log('All months in range:', allMonths);
  
  // Initialize data structures for processing
  const channelMonthlyData: Record<string, Record<string, number>> = {};
  const channelTotals: Record<string, number> = {};
  
  // Log for debugging
  console.log(`Processing ${rawSalesData.length} sales records across ${allMonths.length} months`);
  console.log('Raw data sample (first few records):', 
    rawSalesData.slice(0, Math.min(5, rawSalesData.length)));
  
  // First, pre-initialize all available channels with zero values for all months
  // This ensures we have channel entries even if there's no data for the selected time period
  for (const channelCode of Object.keys(channelNameMap)) {
    channelMonthlyData[channelCode] = {};
    channelTotals[channelCode] = 0;
    
    // Initialize all months with zero
    allMonths.forEach(month => {
      channelMonthlyData[channelCode][month] = 0;
    });
  }
  
  // Also initialize any channels found in the raw data (which might not be in channelNameMap)
  for (const item of rawSalesData) {
    const { channel } = item;
    
    if (!channel) continue;
    
    if (!channelMonthlyData[channel]) {
      console.log(`Found channel code ${channel} in data that wasn't in channel mapping table`);
      channelMonthlyData[channel] = {};
      channelTotals[channel] = 0;
      
      // Initialize all months with zero for this channel
      allMonths.forEach(month => {
        channelMonthlyData[channel][month] = 0;
      });
    }
  }
  
  // Process the sales data
  for (const item of rawSalesData) {
    const { year_month: month, channel, total_sales: amount } = item;
    
    // Skip items with invalid data
    if (!channel || amount === null || amount === undefined || !month) {
      console.log('Skipping invalid sales record:', item);
      continue;
    }
    
    // Double check the channel is initialized (should be from above)
    if (!channelMonthlyData[channel]) {
      // This shouldn't happen given the pre-initialization above, but just in case
      console.warn(`Channel ${channel} was not pre-initialized, doing it now`);
      channelMonthlyData[channel] = {};
      channelTotals[channel] = 0;
      
      // Initialize all months with zero
      allMonths.forEach(m => {
        channelMonthlyData[channel][m] = 0;
      });
    }
    
    // Ensure we only count months within our requested range
    if (allMonths.includes(month)) {
      // Add sales to the appropriate month (accumulating values)
      channelMonthlyData[channel][month] = (channelMonthlyData[channel][month] || 0) + Number(amount);
      
      // Add to channel total
      channelTotals[channel] += Number(amount);
    } else {
      console.warn(`Month ${month} is outside the requested range and will be ignored`);
    }
  }
  
  // Log some debug information about channels
  console.log('Total channels found:', Object.keys(channelMonthlyData).length);
  console.log('Channel codes:', Object.keys(channelMonthlyData));
  
  // Create the final formatted data
  const channelSalesData: ChannelData[] = Object.keys(channelMonthlyData)
    // Only include channels that either have data or are in the channel name map
    .filter(channel => channelTotals[channel] > 0 || channelNameMap[channel])
    .map(channel => ({
      channel,
      channel_name: channelNameMap[channel] || channel,
      total: channelTotals[channel],
      months: channelMonthlyData[channel]
    }));
  
  // Debug information
  console.log(`Processed ${channelSalesData.length} channels across ${allMonths.length} months`);
  console.log('Channel totals:', channelTotals);
  if (channelSalesData.length > 0) {
    console.log('First channel data example:', channelSalesData[0]);
  }
  
  // Sort channels by total sales (descending)
  channelSalesData.sort((a, b) => b.total - a.total);
  
  return { 
    channelSalesData,
    months: allMonths
  };
}
