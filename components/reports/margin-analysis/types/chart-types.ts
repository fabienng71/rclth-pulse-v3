
/**
 * Types for chart components
 */

// Props for charts
export interface ChartViewProps {
  currentData: any[];
  activeTab: string;
  getBarColor: (marginPercent: number) => string;
}
