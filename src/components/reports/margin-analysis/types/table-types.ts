
import { SortDirection, SortField } from '@/hooks/useMarginTableSort';
import { MarginItem, MarginCustomer, MarginCategory, MarginColorScheme } from './base-types';

/**
 * Types for table components
 */

// Props for table components
export interface MarginTableProps {
  activeTab: string;
  currentData: (MarginItem | MarginCustomer | MarginCategory)[];
  getBarColor: (margin: number) => string;
  colors: MarginColorScheme;
}

export interface ItemsTableViewProps {
  currentData: MarginItem[];
  getBarColor: (margin: number) => string;
  colors: MarginColorScheme;
}

export interface CustomersTableViewProps {
  currentData: MarginCustomer[];
  getBarColor: (margin: number) => string;
  colors: MarginColorScheme;
}

export interface CategoriesTableViewProps {
  currentData: MarginCategory[];
  getBarColor: (margin: number) => string;
  colors: MarginColorScheme;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
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

export interface ExportOptionsProps {
  data: any[];
  filename: string;
  year: number;
  month: number;
}
