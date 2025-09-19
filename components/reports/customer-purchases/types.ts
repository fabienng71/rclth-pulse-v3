
export interface CustomerPurchase {
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

export interface CustomerPurchasesTableProps {
  customerPurchases: CustomerPurchase[];
  isLoading: boolean;
  showAmount?: boolean;
}

export type SortField = 'customer_code' | 'search_name' | 'total' | 'margin' | 'last_price' | string;
