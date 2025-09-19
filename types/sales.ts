
export interface MonthlyItemData {
  item_code: string;
  description: string | null;
  base_unit_code: string | null;
  month_data: {
    [key: string]: {
      quantity: number;
      amount: number;
      margin?: number;
    }
  };
  totals: {
    quantity: number;
    amount: number;
    margin?: number;
  };
}

export interface SalesDataItem {
  item_code: string | null;
  description: string | null;
  base_unit_code: string | null;
  posting_date: string | null;
  quantity: number | null;
  amount: number | null;
}

export interface CogsItem {
  item_code: string;
  cogs_unit: number;
}
