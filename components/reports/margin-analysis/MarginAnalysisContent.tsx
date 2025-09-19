import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewMode, ProcessedMarginData, MarginItem, MarginCustomer, MarginCategory } from './types';
import { TabContent } from './tabs/TabContent';
import { TabNavigation } from './tabs/TabNavigation';
import { TopNSelectorWrapper } from './tabs/TopNSelectorWrapper';

// Define getBarColor function to properly calculate color based on margin percent
const getBarColor = (marginPercent: number): string => {
  if (marginPercent >= 28) return '#22c55e'; // green-500
  if (marginPercent >= 20) return '#f59e0b'; // amber-500
  if (marginPercent >= 15) return '#ea580c'; // orange-600
  return '#ef4444'; // red-500
};

interface MarginAnalysisContentProps {
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

const MarginAnalysisContent: React.FC<MarginAnalysisContentProps> = ({
  activeTab,
  setActiveTab,
  marginData,
  filteredItems,
  filteredCustomers,
  filteredCategories,
  selectedYear,
  selectedMonth,
  isLoading,
  topN,
  onTopNChange,
  isMobile,
  viewMode
}) => {
  // Early loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[120px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={activeTab} 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <TopNSelectorWrapper 
          activeTab={activeTab}
          topN={topN}
          onTopNChange={onTopNChange}
        />
        
        <TabContent 
          activeTab={activeTab}
          marginData={marginData}
          filteredItems={filteredItems}
          filteredCustomers={filteredCustomers}
          filteredCategories={filteredCategories}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          getBarColor={getBarColor}
          viewMode={viewMode}
        />
      </Tabs>
    </div>
  );
};

export default MarginAnalysisContent;
