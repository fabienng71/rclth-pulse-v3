
export interface CustomerPurchase {
  item_code: string;
  description: string | null;
  base_unit_code: string | null;
  month_data: {
    [key: string]: {
      quantity: number;
      amount: number;
    }
  };
  totals: {
    quantity: number;
    amount: number;
  };
  margin_percent: number | null;
  last_unit_price: number | null;
  cogs_unit: number | null;
}
