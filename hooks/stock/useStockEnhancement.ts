import { useMemo } from 'react';
import { useLastMonthConsumption } from '../useLastMonthConsumption';
import { StockItem } from './useStockDataFetching';

export const useStockEnhancement = (stockData: StockItem[] | undefined) => {
  // Get item codes for consumption calculation - memoize to prevent unnecessary re-computation
  const itemCodes = useMemo(() => {
    return stockData?.map(item => item.item_code) || [];
  }, [stockData]);
  
  // Fetch last month consumption data
  const { data: consumptionData, isLoading: isLoadingConsumption } = useLastMonthConsumption(itemCodes);
  
  // Debug logging for the consumption data
  const debugItem = 'IPS0WW0000551';
  if (consumptionData && itemCodes.includes(debugItem)) {
    const debugConsumption = consumptionData.find(c => c.item_code === debugItem);
    console.log(`[Enhancement Debug] Consumption data for ${debugItem}:`, debugConsumption);
  }

  // Merge consumption data with stock data - memoize for performance
  const enhancedStockData = useMemo(() => {
    if (!stockData) return [];
    
    return stockData.map(item => {
      const consumption = consumptionData?.find(c => c.item_code === item.item_code);
      const lastMonthConsumption = consumption?.last_month_consumption || 0;
      
      // Calculate days of stock using adjusted quantity and last month consumption
      const daysOfStock = lastMonthConsumption > 0 ? Math.min(item.adjusted_quantity / (lastMonthConsumption / 30), 999) : 999;
      
      // Improved status logic based on last month consumption
      let stockStatus: 'critical' | 'low' | 'normal' | 'unknown' = 'unknown';
      if (lastMonthConsumption > 0) {
        if (daysOfStock < 7) {
          stockStatus = 'critical';
        } else if (daysOfStock < 30) {
          stockStatus = 'low';
        } else {
          stockStatus = 'normal';
        }
      } else if (item.adjusted_quantity > 0) {
        // Items with stock but no consumption are normal
        stockStatus = 'normal';
      } else {
        // Items with no stock and no consumption are unknown
        stockStatus = 'unknown';
      }
      
      return {
        ...item,
        last_month_consumption: lastMonthConsumption,
        days_of_stock: daysOfStock,
        stock_status: stockStatus
      };
    });
  }, [stockData, consumptionData]);

  return {
    enhancedStockData,
    isLoadingConsumption,
  };
};