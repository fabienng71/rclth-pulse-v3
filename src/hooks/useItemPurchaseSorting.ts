
import { useState, useMemo } from 'react';
import { CustomerPurchase } from '@/components/reports/customer-details/types';

export type SortDirection = 'asc' | 'desc';
export type SortField = 'item_code' | 'description' | 'total' | 'margin' | 'last_price' | string;

export const useItemPurchaseSorting = (
  purchaseData: CustomerPurchase[],
  showAmount: boolean
) => {
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...purchaseData].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'item_code') {
        return (a.item_code > b.item_code ? 1 : -1) * direction;
      } else if (sortField === 'description') {
        const aDesc = a.description || '';
        const bDesc = b.description || '';
        return (aDesc > bDesc ? 1 : -1) * direction;
      } else if (sortField === 'total') {
        if (showAmount) {
          return (a.totals.amount - b.totals.amount) * direction;
        } else {
          return (a.totals.quantity - b.totals.quantity) * direction;
        }
      } else if (sortField === 'margin') {
        const aMargin = a.margin_percent || 0;
        const bMargin = b.margin_percent || 0;
        return (aMargin - bMargin) * direction;
      } else if (sortField === 'last_price') {
        const aPrice = a.last_unit_price || 0;
        const bPrice = b.last_unit_price || 0;
        return (aPrice - bPrice) * direction;
      } else if (sortField.startsWith('month_')) {
        const month = sortField.substring(6); // Remove 'month_' prefix
        const aValue = showAmount 
          ? (a.month_data[month]?.amount || 0)
          : (a.month_data[month]?.quantity || 0);
        const bValue = showAmount 
          ? (b.month_data[month]?.amount || 0)
          : (b.month_data[month]?.quantity || 0);
        return (aValue - bValue) * direction;
      }
      
      return 0;
    });
  }, [purchaseData, sortField, sortDirection, showAmount]);

  return {
    sortedData,
    sortField,
    sortDirection,
    handleSort
  };
};
