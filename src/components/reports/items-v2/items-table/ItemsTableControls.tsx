import React from 'react';
import { Button } from '@/components/ui/button';

interface ItemsTableControlsProps {
  selectedItems: string[];
  onSelectionClear?: () => void;
}

export const ItemsTableControls: React.FC<ItemsTableControlsProps> = ({
  selectedItems,
  onSelectionClear
}) => {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline">
          Bulk Quote
        </Button>
        <Button size="sm" variant="outline">
          Export Selected
        </Button>
        <Button size="sm" variant="ghost" onClick={onSelectionClear}>
          Clear
        </Button>
      </div>
    </div>
  );
};