import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ItemAnalytics, ItemsV2SortOptions, ItemsV2ViewConfig } from '@/types/itemsV2';
import { cn } from '@/lib/utils';
import {
  ItemsTableLoadingState,
  ItemsTableEmptyState,
  ItemsTableControls,
  ItemsTableHeader,
  ItemsTableRow
} from './items-table';

interface ItemsTableProps {
  items: ItemAnalytics[];
  isLoading: boolean;
  viewConfig: ItemsV2ViewConfig;
  sortOptions: ItemsV2SortOptions;
  selectedItems?: string[];
  onSortChange: (sort: ItemsV2SortOptions) => void;
  onSelectionChange?: (selectedItems: string[]) => void;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
  onViewDetails?: (itemCode: string) => void;
  onToggleFavorite?: (itemCode: string) => void;
  className?: string;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  isLoading,
  viewConfig,
  sortOptions,
  selectedItems = [],
  onSortChange,
  onSelectionChange,
  onQuickQuote,
  onRequestSample,
  onViewDetails,
  onToggleFavorite,
  className,
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(items.map(item => item.item_code));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectItem = (itemCode: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedItems, itemCode]);
    } else {
      onSelectionChange(selectedItems.filter(code => code !== itemCode));
    }
  };

  const isAllSelected = items.length > 0 && selectedItems.length === items.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < items.length;

  if (isLoading) {
    return <ItemsTableLoadingState className={className} />;
  }

  if (items.length === 0) {
    return <ItemsTableEmptyState />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table controls */}
      <ItemsTableControls 
        selectedItems={selectedItems} 
        onSelectionClear={() => onSelectionChange?.([])} 
      />

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <ItemsTableHeader
            viewConfig={viewConfig}
            sortOptions={sortOptions}
            onSortChange={onSortChange}
            onSelectionChange={onSelectionChange}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={handleSelectAll}
          />
          
          <TableBody>
            {items.map((item) => (
              <ItemsTableRow
                key={item.item_code}
                item={item}
                viewConfig={viewConfig}
                selectedItems={selectedItems}
                hoveredRow={hoveredRow}
                onSelectionChange={onSelectionChange}
                onSelectItem={handleSelectItem}
                onViewDetails={onViewDetails}
                onQuickQuote={onQuickQuote}
                onRequestSample={onRequestSample}
                onToggleFavorite={onToggleFavorite}
                onMouseEnter={() => setHoveredRow(item.item_code)}
                onMouseLeave={() => setHoveredRow(null)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemsTable;