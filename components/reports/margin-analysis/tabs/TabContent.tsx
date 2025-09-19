
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ChartView } from '../chart/ChartView';
import { TableView } from '../table/TableView';
import { MarginSummaryCard } from '../MarginSummaryCard';
import { MarginInsights } from '../MarginInsights';
import { TabContentProps } from '../types';

export const TabContent = ({
  activeTab,
  marginData,
  filteredItems,
  filteredCustomers,
  filteredCategories,
  selectedYear,
  selectedMonth,
  getBarColor,
  viewMode
}: TabContentProps) => {
  const categoriesData = filteredCategories || marginData?.categories || [];
  
  // Get chart data based on active tab
  const getChartData = () => {
    if (activeTab === 'items') {
      return filteredItems?.slice(0, 10) || [];
    } else if (activeTab === 'customers') {
      return filteredCustomers?.slice(0, 10) || [];
    } else if (activeTab === 'categories') {
      return categoriesData?.slice(0, 10) || [];
    }
    return [];
  };
  
  // Colors configuration for margin indicators
  const colors = {
    high: 'text-green-600',
    medium: 'text-amber-500',
    mediumLow: 'text-orange-600',
    low: 'text-red-500'
  };
  
  // Render summary tab content
  if (activeTab === "summary") {
    return (
      <TabsContent value="summary">
        {marginData?.overall && (
          <MarginSummaryCard 
            data={marginData.overall}
            year={selectedYear}
            month={selectedMonth}
            viewMode={viewMode}
          />
        )}
        
        <TableView 
          activeTab="summary"
          currentData={marginData?.topItems?.slice(0, 10) || []}
          getBarColor={getBarColor}
          colors={colors}
        />
      </TabsContent>
    );
  }
  
  // Render items tab content
  if (activeTab === "items") {
    return (
      <TabsContent value="items">
        <TableView 
          activeTab="items"
          currentData={filteredItems || []}
          getBarColor={getBarColor}
          colors={colors}
        />
      </TabsContent>
    );
  }
  
  // Render customers tab content
  if (activeTab === "customers") {
    return (
      <TabsContent value="customers">
        <TableView 
          activeTab="customers"
          currentData={filteredCustomers || []}
          getBarColor={getBarColor}
          colors={colors}
        />
      </TabsContent>
    );
  }
  
  // Render categories tab content
  if (activeTab === "categories") {
    return (
      <TabsContent value="categories">
        <TableView 
          activeTab="categories"
          currentData={categoriesData}
          getBarColor={getBarColor}
          colors={colors}
        />
      </TabsContent>
    );
  }
  
  // Render chart tab content
  if (activeTab === "chart") {
    return (
      <TabsContent value="chart">
        <Card>
          <CardContent className="pt-6">
            <ChartView 
              currentData={getChartData()}
              activeTab={activeTab}
              getBarColor={getBarColor}
            />
          </CardContent>
        </Card>
      </TabsContent>
    );
  }
  
  // Render AI insights tab content
  if (activeTab === "insights") {
    return (
      <TabsContent value="insights">
        <MarginInsights 
          marginData={marginData}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          viewMode={viewMode}
        />
      </TabsContent>
    );
  }
  
  return null;
};
