
import React, { useEffect, useState } from 'react';
import { useMarginAnalysisData } from '@/hooks/useMarginAnalysisData';
import { FilterControls } from './FilterControls';
import { MarginAnalysisHeader } from './MarginAnalysisHeader';
import { useSearchParams } from 'react-router-dom';
import MarginAnalysisContent from './MarginAnalysisContent';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExportOptions } from './ExportOptions';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { ProcessedMarginData, MarginCategory } from './types';

const MarginAnalysisPage = () => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  
  // Get current date for default values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Get year and month from URL params or use current date
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');
  
  // State for year and month - initialized from URL params or defaults
  const [selectedYear, setSelectedYear] = React.useState(yearParam ? parseInt(yearParam, 10) : currentYear);
  const [selectedMonth, setSelectedMonth] = React.useState(monthParam ? parseInt(monthParam, 10) : currentMonth);
  
  // Active tab managed purely through React state, not URL
  const [activeTab, setActiveTab] = React.useState('summary');
  
  // Add search state
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Top N items to show
  const [topN, setTopN] = React.useState<number>(20);
  
  // State for category filter
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  
  // Get margin analysis data
  const { 
    data: marginData,
    isLoading,
    refreshAnalyticsData,
    isRefreshing,
    viewMode,
    setViewMode
  } = useMarginAnalysisData(selectedYear, selectedMonth);
  
  // Add console logging for debugging
  React.useEffect(() => {
    console.log('MarginAnalysisPage - Current state:', {
      activeTab,
      marginData: marginData ? 'loaded' : 'not loaded',
      selectedYear,
      selectedMonth,
      viewMode
    });
  }, [activeTab, marginData, selectedYear, selectedMonth, viewMode]);
  
  // Apply sorting and filtering to various data sets with safe fallbacks
  
  // Filter items by search term if provided
  const filteredBySearchItems = React.useMemo(() => {
    const items = viewMode === 'standard' 
      ? (marginData?.topItems || [])
      : (marginData?.adjustedItems || []);
    
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item && (
        (item.item_code?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [marginData, viewMode, searchTerm]);

  // Filter customers by search term if provided - Updated to include search_name
  const filteredBySearchCustomers = React.useMemo(() => {
    const customers = viewMode === 'standard'
      ? (marginData?.topCustomers || [])
      : (marginData?.adjustedCustomers || []);
    
    if (!searchTerm) return customers;
    
    return customers.filter(customer => 
      customer && (
        (customer.customer_code?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (customer.customer_name && customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.search_name && customer.search_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [marginData, viewMode, searchTerm]);
    
  // Filter categories by selected category if one is selected
  const filteredCategories = React.useMemo(() => {
    const categories = marginData?.categories || [];
    
    if (!selectedCategory) return categories;
    
    return categories.filter(cat => 
      cat && cat.posting_group === selectedCategory
    );
  }, [marginData, selectedCategory]);
  
  // Handle year change without affecting URL
  const handleYearChange = (year: number) => {
    console.log('Year changed to:', year);
    setSelectedYear(year);
  };

  // Handle month change without affecting URL
  const handleMonthChange = (month: number) => {
    console.log('Month changed to:', month);
    setSelectedMonth(month);
  };
  
  // Handle tab change without affecting URL
  const handleTabChange = (tab: string) => {
    console.log('Tab changed to:', tab);
    setActiveTab(tab);
  };
  
  // Handle category filter change
  const handleCategoryChange = (category: string | null) => {
    console.log('Category filter changed to:', category);
    setSelectedCategory(category);
  };
  
  // Handle search term change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };
  
  // Limit data to top N items, or show all if topN is -1
  const limitedFilteredItems = React.useMemo(() => {
    return topN === -1 
      ? filteredBySearchItems 
      : filteredBySearchItems?.slice(0, topN) || [];
  }, [filteredBySearchItems, topN]);
    
  const limitedFilteredCustomers = React.useMemo(() => {
    return topN === -1 
      ? filteredBySearchCustomers 
      : filteredBySearchCustomers?.slice(0, topN) || [];
  }, [filteredBySearchCustomers, topN]);
  
  // Reset the category filter when changing tabs
  React.useEffect(() => {
    if (activeTab !== 'categories') {
      setSelectedCategory(null);
    }
  }, [activeTab]);
  
  // Render filters for both desktop and mobile views
  const renderFilters = () => (
    <FilterControls
      year={selectedYear}
      month={selectedMonth}
      onYearChange={handleYearChange}
      onMonthChange={handleMonthChange}
      viewMode={viewMode}
      setViewMode={setViewMode}
      selectedCategory={selectedCategory}
      onCategoryChange={handleCategoryChange}
      activeTab={activeTab}
      categoryOptions={marginData?.categories || []}
    />
  );

  // Transform marginData to match the expected type structure with safe fallbacks
  const transformedMarginData: ProcessedMarginData | undefined = React.useMemo(() => {
    if (!marginData) return undefined;
    
    return {
      overall: marginData.overall || null,
      topItems: Array.isArray(marginData.topItems) ? marginData.topItems : [],
      topCustomers: Array.isArray(marginData.topCustomers) ? marginData.topCustomers : [],
      categories: Array.isArray(marginData.categories) ? marginData.categories as MarginCategory[] : [],
      adjustedItems: Array.isArray(marginData.adjustedItems) ? marginData.adjustedItems : undefined,
      adjustedCustomers: Array.isArray(marginData.adjustedCustomers) ? marginData.adjustedCustomers : undefined
    };
  }, [marginData]);
  
  return (
    <div className="container mx-auto py-8">
      <MarginAnalysisHeader 
        activeTab={activeTab}
        isMobile={isMobile}
        filteredCustomers={limitedFilteredCustomers}
        filteredItems={limitedFilteredItems}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        renderFilters={renderFilters}
      />
      
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshAnalyticsData()}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
        
        <ExportOptions 
          data={marginData || {}} 
          selectedYear={selectedYear} 
          selectedMonth={selectedMonth}
          activeTab={activeTab}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>
      
      {transformedMarginData && (
        <MarginAnalysisContent 
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          marginData={transformedMarginData}
          filteredItems={limitedFilteredItems}
          filteredCustomers={limitedFilteredCustomers}
          filteredCategories={filteredCategories}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          isLoading={isLoading}
          topN={topN}
          onTopNChange={setTopN}
          isMobile={isMobile}
          viewMode={viewMode}
        />
      )}
    </div>
  );
};

export default MarginAnalysisPage;
