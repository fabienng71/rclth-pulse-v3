
import { useMemo } from 'react';
import { SortDirection } from '@/hooks/useSortableTable';

type SortField = 'customer_code' | 'search_name' | 'total' | 'margin' | 'last_price' | string;

interface CustomerPurchase {
  customer_code: string;
  customer_name: string | null;
  search_name: string | null;
  month_data: {
    [key: string]: {
      amount: number;
      quantity: number;
    }
  };
  total_amount: number;
  total_quantity: number;
  margin_percent: number | null;
  last_unit_price: number | null;
}

export function useCustomerPurchasesSorting(
  customerPurchases: CustomerPurchase[],
  sortField: SortField,
  sortDirection: SortDirection,
  showAmount: boolean,
  allMonths: string[]
) {
  const sortedData = useMemo(() => {
    return [...customerPurchases].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'customer_code') {
        return (a.customer_code > b.customer_code ? 1 : -1) * direction;
      } else if (sortField === 'search_name') {
        return ((a.search_name || '') > (b.search_name || '') ? 1 : -1) * direction;
      } else if (sortField === 'total') {
        if (showAmount) {
          return (a.total_amount - b.total_amount) * direction;
        } else {
          return (a.total_quantity - b.total_quantity) * direction;
        }
      } else if (sortField === 'margin') {
        const aMargin = a.margin_percent || 0;
        const bMargin = b.margin_percent || 0;
        return (aMargin - bMargin) * direction;
      } else if (sortField === 'last_price') {
        const aPrice = a.last_unit_price || 0;
        const bPrice = b.last_unit_price || 0;
        return (aPrice - bPrice) * direction;
      } else if (allMonths.includes(sortField)) {
        const aValue = showAmount 
          ? (a.month_data[sortField]?.amount || 0)
          : (a.month_data[sortField]?.quantity || 0);
        const bValue = showAmount 
          ? (b.month_data[sortField]?.amount || 0)
          : (b.month_data[sortField]?.quantity || 0);
        return (aValue - bValue) * direction;
      }
      
      return 0;
    });
  }, [customerPurchases, sortField, sortDirection, showAmount, allMonths]);

  return sortedData;
}
