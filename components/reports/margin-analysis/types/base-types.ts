
/**
 * Base types for margin analysis shared across components
 */

// Base type for margin items with common fields
export interface BaseMarginItem {
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
  posting_group?: string;
}

// Color scheme for margin visualization
export interface MarginColorScheme {
  high: string;
  medium: string;
  low: string;
}

// Overall margin data with adjustment information
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

// Raw analysis data from API
export interface MarginAnalysisData {
  analysis_type: string;
  data: any[];
}

// Processed margin data for components
export interface ProcessedMarginData {
  topItems: MarginItem[];
  lowItems: MarginItem[];
  topCustomers: MarginCustomer[];
  lowCustomers: MarginCustomer[];
  categories: MarginCategory[];
  vendors: MarginVendor[];
  overall: MarginOverallData | null;
  adjustedItems?: MarginItem[];
  adjustedCustomers?: MarginCustomer[];
}

// Types for different margin items
export interface MarginItem extends BaseMarginItem {
  item_code: string;
  description: string;
  vendor_code?: string;
  vendor_name?: string;
}

// Customer specific margin data
export interface MarginCustomer extends BaseMarginItem {
  customer_code: string;
  customer_name: string;
  search_name?: string | null; // Added search_name field
}

// Category specific margin data
export interface MarginCategory extends BaseMarginItem {
  posting_group: string;
}

// Vendor specific margin data
export interface MarginVendor extends BaseMarginItem {
  vendor_code: string;
  vendor_name: string;
}

// View mode type
export type ViewMode = 'standard' | 'adjusted';
