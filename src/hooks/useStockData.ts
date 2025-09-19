
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePersistedStockFilters } from './usePersistedStockFilters';
import { useStockDataFetching, type StockItem } from './stock/useStockDataFetching';
import { useStockEnhancement } from './stock/useStockEnhancement';
import { useStockFiltering, type StockFilters } from './stock/useStockFiltering';
import { useStockGrouping, type VendorGroup, type GroupedStockItems } from './stock/useStockGrouping';

// Re-export types for backward compatibility
export type { StockItem, VendorGroup, GroupedStockItems, StockFilters };

export const useStockData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [stockFilters, setStockFilters] = usePersistedStockFilters();

  const { data: stockData, isLoading, error, refetch } = useStockDataFetching(debouncedSearchTerm);
  const { enhancedStockData, isLoadingConsumption } = useStockEnhancement(stockData);
  const { filteredItems } = useStockFiltering(enhancedStockData, debouncedSearchTerm, stockFilters);
  const { groupedItems } = useStockGrouping(filteredItems, debouncedSearchTerm);
  
  return {
    items: enhancedStockData,
    filteredItems,
    groupedItems,
    isLoading: isLoading || isLoadingConsumption,
    error,
    refetch,
    searchTerm,
    setSearchTerm,
    stockFilters,
    setStockFilters
  };
};
