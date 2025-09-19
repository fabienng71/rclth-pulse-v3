
export interface MarginOverallData {
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
  total_credit_memos?: number;
  credit_memo_amount?: number;
  credit_memo_quantity?: number;
  adjusted_sales?: number;
  adjusted_margin?: number;
  adjusted_margin_percent?: number;
}

export interface MarginItem {
  item_code: string;
  description: string;
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
  posting_group?: string;
  vendor_code?: string;
  vendor_name?: string;
}

export interface MarginCustomer {
  customer_code: string;
  customer_name: string;
  search_name?: string | null;
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
}

export interface MarginCategory {
  posting_group: string;
  category_description?: string;
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
}

export interface ProcessedMarginData {
  overall: MarginOverallData | null;
  topItems: MarginItem[];
  topCustomers: MarginCustomer[];
  categories: MarginCategory[];
  adjustedItems?: MarginItem[];
  adjustedCustomers?: MarginCustomer[];
}

export type ViewMode = 'standard' | 'adjusted';

export interface MarginColorScheme {
  high: string;
  medium: string;
  mediumLow: string;
  low: string;
}

// Component Props Types
export interface TopNSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export interface MarginChartProps {
  itemsData: MarginItem[];
  customersData: MarginCustomer[];
  categoriesData: MarginCategory[];
  isLoading: boolean;
  activeTab: string;
}

export interface ChartViewProps {
  currentData: any[];
  activeTab: string;
  getBarColor: (marginPercent: number) => string;
}

export interface MarginTableProps {
  activeTab: string;
  currentData: any[];
  getBarColor: (marginPercent: number) => string;
  colors?: MarginColorScheme;
}

export interface TabContentProps {
  activeTab: string;
  marginData: ProcessedMarginData;
  filteredItems: MarginItem[];
  filteredCustomers: MarginCustomer[];
  filteredCategories?: MarginCategory[];
  selectedYear: number;
  selectedMonth: number;
  getBarColor: (marginPercent: number) => string;
  viewMode: ViewMode;
}

export interface MarginItemsTableProps {
  title: string;
  items: MarginItem[];
  isLoading: boolean;
  emptyMessage?: string;
}

export interface MarginCustomersTableProps {
  title: string;
  customers: MarginCustomer[];
  isLoading: boolean;
  emptyMessage?: string;
}
