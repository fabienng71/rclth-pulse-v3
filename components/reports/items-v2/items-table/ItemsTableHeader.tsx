import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ItemsV2SortOptions, ItemsV2ViewConfig } from '@/types/itemsV2';

interface ItemsTableHeaderProps {
  viewConfig: ItemsV2ViewConfig;
  sortOptions: ItemsV2SortOptions;
  onSortChange: (sort: ItemsV2SortOptions) => void;
  onSelectionChange?: (selectedItems: string[]) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const ItemsTableHeader: React.FC<ItemsTableHeaderProps> = ({
  viewConfig,
  sortOptions,
  onSortChange,
  onSelectionChange,
  isAllSelected,
  isIndeterminate,
  onSelectAll
}) => {
  const defaultColumns = ['item_code', 'description', 'price', 'margin', 'stock', 'performance', 'actions'];
  const visibleColumns = viewConfig.columns_visible || defaultColumns;

  const handleSort = (field: ItemsV2SortOptions['field']) => {
    const newDirection = 
      sortOptions.field === field && sortOptions.direction === 'desc' ? 'asc' : 'desc';
    onSortChange({ field, direction: newDirection });
  };

  const getSortIcon = (field: string) => {
    if (sortOptions.field !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortOptions.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <TableHeader>
      <TableRow>
        {onSelectionChange && (
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all items"
              {...(isIndeterminate && { 'data-state': 'indeterminate' })}
            />
          </TableHead>
        )}

        {visibleColumns.includes('item_code') && (
          <TableHead>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('item_code')}
              className="h-auto p-0 font-medium"
            >
              Item Code
              {getSortIcon('item_code')}
            </Button>
          </TableHead>
        )}

        {visibleColumns.includes('description') && (
          <TableHead>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('description')}
              className="h-auto p-0 font-medium"
            >
              Description
              {getSortIcon('description')}
            </Button>
          </TableHead>
        )}

        {visibleColumns.includes('price') && (
          <TableHead className="text-right">
            Price
          </TableHead>
        )}

        {visibleColumns.includes('margin') && (
          <TableHead>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('margin_percent')}
              className="h-auto p-0 font-medium"
            >
              Margin
              {getSortIcon('margin_percent')}
            </Button>
          </TableHead>
        )}

        {visibleColumns.includes('stock') && (
          <TableHead>Stock</TableHead>
        )}

        {visibleColumns.includes('performance') && (
          <TableHead>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('performance_score')}
              className="h-auto p-0 font-medium"
            >
              Performance
              {getSortIcon('performance_score')}
            </Button>
          </TableHead>
        )}

        {visibleColumns.includes('velocity') && (
          <TableHead>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('sales_velocity')}
              className="h-auto p-0 font-medium"
            >
              Velocity
              {getSortIcon('sales_velocity')}
            </Button>
          </TableHead>
        )}

        {visibleColumns.includes('last_sale') && (
          <TableHead>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('last_sale_date')}
              className="h-auto p-0 font-medium"
            >
              Last Sale
              {getSortIcon('last_sale_date')}
            </Button>
          </TableHead>
        )}

        {visibleColumns.includes('commission') && (
          <TableHead className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort('commission_impact')}
              className="h-auto p-0 font-medium"
            >
              Commission
              {getSortIcon('commission_impact')}
            </Button>
          </TableHead>
        )}

        {visibleColumns.includes('actions') && (
          <TableHead className="w-20">Actions</TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};