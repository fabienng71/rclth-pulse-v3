
import { useState, useMemo } from 'react';
import { MonthlyItemData } from '@/types/sales';
import { SortDirection } from '@/hooks/useSortableTable';
import { extractSortedMonths } from '../monthly-data';

export type SortField = 'item_code' | 'description' | 'base_unit_code' | 'total' | 'margin' | string;

export function useItemSalesSort(data: MonthlyItemData[], showAmount: boolean) {
  const [sortField, setSortField] = useState<SortField>('item_code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const allMonths = useMemo(() => extractSortedMonths(data), [data]);

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
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'item_code') {
        return (a.item_code > b.item_code ? 1 : -1) * direction;
      } else if (sortField === 'description') {
        return (a.description || '') > (b.description || '') ? direction : -direction;
      } else if (sortField === 'base_unit_code') {
        return (a.base_unit_code || '') > (b.base_unit_code || '') ? direction : -direction;
      } else if (sortField === 'total') {
        const aValue = showAmount ? a.totals.amount : a.totals.quantity;
        const bValue = showAmount ? b.totals.amount : b.totals.quantity;
        return (aValue - bValue) * direction;
      } else if (sortField === 'margin') {
        const aValue = a.totals.margin || 0;
        const bValue = b.totals.margin || 0;
        return (aValue - bValue) * direction;
      } else if (allMonths.includes(sortField)) {
        const aValue = a.month_data[sortField] ? (showAmount ? a.month_data[sortField].amount : a.month_data[sortField].quantity) : 0;
        const bValue = b.month_data[sortField] ? (showAmount ? b.month_data[sortField].amount : b.month_data[sortField].quantity) : 0;
        return (aValue - bValue) * direction;
      }
      
      return 0;
    });
  }, [data, sortField, sortDirection, showAmount, allMonths]);

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedData,
    allMonths
  };
}
