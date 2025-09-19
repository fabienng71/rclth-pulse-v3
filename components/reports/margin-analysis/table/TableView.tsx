
import React from 'react';
import { ItemsTableView } from './ItemsTableView';
import { CustomersTableView } from './CustomersTableView';
import { CategoriesTableView } from './CategoriesTableView';
import { MarginTableProps, MarginItem, MarginCustomer, MarginCategory } from '../types';
import { useMarginTableSort } from '@/hooks/useMarginTableSort';
import { Skeleton } from '@/components/ui/skeleton';

export const TableView = ({ activeTab, currentData, getBarColor, colors }: MarginTableProps) => {
  // Safely handle currentData to ensure it's always an array
  const safeData = Array.isArray(currentData) ? currentData : [];
  
  // Use the sorting hook with safe data
  const { sortField, sortDirection, handleSort, sortedData } = useMarginTableSort(
    safeData, 
    'margin_percent', 
    'desc'
  );
  
  // Define safe default values for color functions to prevent errors
  const safeGetBarColor = getBarColor || (() => colors?.medium || '#f59e0b');
  const safeColors = colors || { 
    high: '#22c55e', 
    medium: '#f59e0b', 
    mediumLow: '#ea580c', 
    low: '#ef4444' 
  };
  
  // Show loading skeleton if no data is available
  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  
  // Calculate dynamic height based on number of rows, min 300px, max 600px
  const tableHeight = Math.min(600, Math.max(300, (sortedData.length * 48) + 56));
  
  if (activeTab === "items") {
    // Filter the data to only include MarginItems with proper type checking
    const itemsData = sortedData.filter((item): item is MarginItem => 
      item && 
      typeof item === 'object' && 
      'item_code' in item && 
      'description' in item &&
      typeof item.item_code === 'string'
    );
    
    return (
      <div className="overflow-auto" style={{ maxHeight: `${tableHeight}px` }}>
        <ItemsTableView 
          currentData={itemsData} 
          sortField={sortField} 
          sortDirection={sortDirection} 
          handleSort={handleSort}
          getBarColor={safeGetBarColor}
          colors={safeColors}
        />
      </div>
    );
  } else if (activeTab === "customers") {
    // Filter the data to only include MarginCustomers with proper type checking
    const customersData = sortedData.filter((item): item is MarginCustomer => 
      item && 
      typeof item === 'object' && 
      'customer_code' in item && 
      'customer_name' in item &&
      typeof item.customer_code === 'string'
    );
    
    return (
      <div className="overflow-auto" style={{ maxHeight: `${tableHeight}px` }}>
        <CustomersTableView 
          currentData={customersData}
          sortField={sortField} 
          sortDirection={sortDirection} 
          handleSort={handleSort}
          getBarColor={safeGetBarColor}
          colors={safeColors}
        />
      </div>
    );
  } else if (activeTab === "categories") {
    // Filter the data to only include MarginCategories with proper type checking
    const categoriesData = sortedData.filter((item): item is MarginCategory => 
      item && 
      typeof item === 'object' && 
      'posting_group' in item &&
      typeof item.posting_group === 'string'
    );
    
    return (
      <div className="overflow-auto" style={{ maxHeight: `${tableHeight}px` }}>
        <CategoriesTableView 
          currentData={categoriesData}
          sortField={sortField} 
          sortDirection={sortDirection} 
          onSort={handleSort}
          getBarColor={safeGetBarColor}
          colors={safeColors}
        />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-muted-foreground">No data available for this tab.</p>
    </div>
  );
};
