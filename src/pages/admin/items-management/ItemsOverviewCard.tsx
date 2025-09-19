import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ItemsSearchBar } from '@/components/admin/items/ItemsHeader';
import { BatchActionsToolbar } from '@/components/admin/items/BatchActionsToolbar';
import { ItemsTable } from '@/components/admin/items/ItemsTable';
import { ItemsFilters } from '@/hooks/useItemsData';

interface ItemsOverviewCardProps {
  filters: ItemsFilters;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filteredItems: any[];
  isLoading: boolean;
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  onEdit: (item: any) => void;
  onDelete: (itemCode: string) => void;
  isDeleting: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onBatchEdit: () => void;
  onBatchDelete: () => void;
  onBatchExport: () => void;
  onClearSelection: () => void;
  isBatchProcessing: boolean;
}

export const ItemsOverviewCard: React.FC<ItemsOverviewCardProps> = ({
  filters,
  searchTerm,
  onSearchChange,
  filteredItems,
  isLoading,
  selectedItems,
  onSelectionChange,
  onEdit,
  onDelete,
  isDeleting,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onBatchEdit,
  onBatchDelete,
  onBatchExport,
  onClearSelection,
  isBatchProcessing
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Items Overview</CardTitle>
            <CardDescription>
              View and manage all items in the system
              {(filters.categories.length > 0 || filters.brands.length > 0 || filters.vendors.length > 0 || filters.showOnlyUnassigned) && (
                <span className="ml-2 text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  Filtered
                </span>
              )}
            </CardDescription>
          </div>
          <ItemsSearchBar 
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <BatchActionsToolbar
          selectedItems={selectedItems}
          onBatchEdit={onBatchEdit}
          onBatchDelete={onBatchDelete}
          onBatchExport={onBatchExport}
          onClearSelection={onClearSelection}
          isLoading={isBatchProcessing}
        />
        
        <ItemsTable
          filteredItems={filteredItems}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          selectedItems={selectedItems}
          onSelectionChange={onSelectionChange}
        />
      </CardContent>
    </Card>
  );
};