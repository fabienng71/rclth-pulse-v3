
import React, { useState } from 'react';
import { SelectedItem } from './items/types';
import ItemsSectionHeader from './items/ItemsSectionHeader';
import ItemSearchPopover from './items/ItemSearchPopover';
import ItemsTable from './items/ItemsTable';
import BatchItemsDialog from './items/BatchItemsDialog';

interface ItemsSectionProps {
  selectedItems: SelectedItem[];
  onAddItem: (item: { item_code: string, description: string, base_unit_code?: string }) => void;
  onRemoveItem: (itemCode: string) => void;
  onUpdateQuantity: (itemCode: string, quantity: number) => void;
  onUpdateBaseUnitCode: (itemCode: string, base_unit_code: string) => void;
  onUpdateDirectUnitCost: (itemCode: string, direct_unit_cost: number) => void;
}

const ItemsSection: React.FC<ItemsSectionProps> = ({
  selectedItems,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateBaseUnitCode,
  onUpdateDirectUnitCost
}) => {
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  
  const handleAddMultipleItems = (items: { item_code: string, description: string, base_unit_code?: string }[]) => {
    // Add all items without filtering duplicates - allow duplicate item codes
    items.forEach(item => onAddItem(item));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ItemsSectionHeader onBatchAddClick={() => setIsBatchDialogOpen(true)} />
        <ItemSearchPopover onItemSelect={onAddItem} />
      </div>

      <ItemsTable 
        items={selectedItems}
        onRemoveItem={onRemoveItem}
        onUpdateQuantity={onUpdateQuantity}
        onUpdateBaseUnitCode={onUpdateBaseUnitCode}
        onUpdateDirectUnitCost={onUpdateDirectUnitCost}
      />
      
      <BatchItemsDialog
        isOpen={isBatchDialogOpen}
        onClose={() => setIsBatchDialogOpen(false)}
        onAddItems={handleAddMultipleItems}
      />
    </div>
  );
};

export default ItemsSection;
