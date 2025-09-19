
import { MarginItem, MarginCustomer, MarginCategory, MarginOverallData, ProcessedMarginData, ViewMode } from './base-types';

/**
 * Props interfaces for margin analysis components
 */

// Props for main components
export interface MarginAnalysisContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  marginData: ProcessedMarginData;
  filteredItems: MarginItem[];
  filteredCustomers: MarginCustomer[];
  filteredCategories?: MarginCategory[];
  selectedYear: number;
  selectedMonth: number;
  isLoading: boolean;
  topN: number;
  onTopNChange: (value: number) => void;
  isMobile: boolean;
  viewMode: ViewMode;
}

export interface MarginChartProps {
  itemsData: MarginItem[];
  customersData: MarginCustomer[];
  categoriesData: MarginCategory[];
  isLoading: boolean;
  activeTab: string;
}

export interface MarginSummaryCardProps {
  data: MarginOverallData | null;
  year: number;
  month: number;
  isLoading: boolean;
  viewMode?: ViewMode;
}

export interface MarginInsightsProps {
  marginData: ProcessedMarginData;
  selectedYear: number;
  selectedMonth: number;
  isLoading: boolean;
  viewMode?: ViewMode;
}

export interface TopNSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export interface FilterControlsProps {
  categories: MarginCategory[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  marginRange: [number, number];
  onMarginRangeChange: (range: [number, number]) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export interface MarginAnalysisHeaderProps {
  activeTab: string;
  isMobile: boolean;
  filteredCustomers: MarginCustomer[];
  filteredItems: MarginItem[];
  selectedYear: number;
  selectedMonth: number;
  renderFilters: () => React.ReactNode;
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

export interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface TopNSelectorWrapperProps {
  activeTab: string;
  topN: number;
  onTopNChange: (value: number) => void;
}
