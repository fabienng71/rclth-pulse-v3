
import { useState, useMemo } from 'react';
import { CollaborativeForecastData } from '@/hooks/useForecastSessions';
import { VendorStockItem } from '@/hooks/useVendorStockItems';

export type SortField = 'item_code' | 'item_description' | 'total_quantity' | 'unit' | 'stock' | 'consumption';
export type SortDirection = 'asc' | 'desc';

export const useSortableCollaborativeTable = (data: CollaborativeForecastData[]) => {
  const [sortField, setSortField] = useState<SortField>('item_code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'item_code':
          aValue = a.item_code || '';
          bValue = b.item_code || '';
          break;
        case 'item_description':
          aValue = a.item_description || '';
          bValue = b.item_description || '';
          break;
        case 'total_quantity':
          aValue = a.forecast_quantity || 0;
          bValue = b.forecast_quantity || 0;
          break;
        default:
          aValue = a.item_code || '';
          bValue = b.item_code || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data, sortField, sortDirection]);

  const sortGroupedData = (groupedData: Record<string, CollaborativeForecastData[]>) => {
    return Object.entries(groupedData).sort(([aKey, aForecasts], [bKey, bForecasts]) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'item_code':
          aValue = aKey;
          bValue = bKey;
          break;
        case 'item_description':
          aValue = aForecasts[0]?.item_description || '';
          bValue = bForecasts[0]?.item_description || '';
          break;
        case 'total_quantity':
          aValue = aForecasts.reduce((sum, f) => sum + (f.forecast_quantity || 0), 0);
          bValue = bForecasts.reduce((sum, f) => sum + (f.forecast_quantity || 0), 0);
          break;
        default:
          aValue = aKey;
          bValue = bKey;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const sortVendorItems = (items: VendorStockItem[]) => {
    return [...items].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'item_code':
          aValue = a.item_code;
          bValue = b.item_code;
          break;
        case 'item_description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'unit':
          aValue = a.base_unit_code;
          bValue = b.base_unit_code;
          break;
        case 'stock':
          aValue = a.current_stock;
          bValue = b.current_stock;
          break;
        case 'consumption':
          aValue = a.last_month_consumption || 0;
          bValue = b.last_month_consumption || 0;
          break;
        default:
          aValue = a.item_code;
          bValue = b.item_code;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  return {
    sortedData,
    sortField,
    sortDirection,
    handleSort,
    sortGroupedData,
    sortVendorItems
  };
};
