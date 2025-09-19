import { useMemo } from 'react';
import { StockItem } from './useStockDataFetching';

export interface StockFilters {
  hideZeroStock: boolean;
  showOnlyCriticalAndLow: boolean;
  showOnlyPricelist: boolean;
}

export const useStockFiltering = (
  enhancedStockData: StockItem[],
  debouncedSearchTerm: string,
  stockFilters: StockFilters
) => {
  // Filter items based on search term - memoize for performance
  const searchFilteredItems = useMemo(() => {
    if (!enhancedStockData.length) return [];
    
    if (!debouncedSearchTerm) return enhancedStockData;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return enhancedStockData.filter(item => 
      item.item_code.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.vendor_name && item.vendor_name.toLowerCase().includes(searchLower))
    );
  }, [enhancedStockData, debouncedSearchTerm]);
  
  // Apply stock filters after search - memoize for performance
  const filteredItems = useMemo(() => {
    if (!searchFilteredItems.length) return [];
    
    let filtered = searchFilteredItems;
    
    // Filter out zero stock items
    if (stockFilters.hideZeroStock) {
      filtered = filtered.filter(item => item.adjusted_quantity > 0);
    }
    
    // Show only critical and low stock items
    if (stockFilters.showOnlyCriticalAndLow) {
      filtered = filtered.filter(item => 
        item.stock_status === 'critical' || item.stock_status === 'low'
      );
    }
    
    // Show only pricelist items
    if (stockFilters.showOnlyPricelist) {
      filtered = filtered.filter(item => item.pricelist === true);
    }
    
    return filtered;
  }, [searchFilteredItems, stockFilters]);

  return {
    searchFilteredItems,
    filteredItems,
  };
};