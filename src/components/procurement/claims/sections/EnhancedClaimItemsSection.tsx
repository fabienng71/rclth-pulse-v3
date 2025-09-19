
import React from 'react';
import { ClaimItem } from '../EnhancedClaimForm';
import ItemSearchSection from '@/components/procurement/search/ItemSearchSection';

interface EnhancedClaimItemsSectionProps {
  items: ClaimItem[];
  onAddItem: (item: ClaimItem) => void;
  onUpdateItem: (index: number, field: keyof ClaimItem, value: any) => void;
  onRemoveItem: (index: number) => void;
}

const EnhancedClaimItemsSection = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}: EnhancedClaimItemsSectionProps) => {
  const handleAddItem = (item: { item_code: string; description: string }) => {
    const newItem: ClaimItem = {
      item_code: item.item_code,
      description: item.description,
      quantity: 1,
      unit_price: undefined
    };
    onAddItem(newItem);
  };

  const handleUpdateQuantity = (itemCode: string, quantity: number) => {
    const index = items.findIndex(item => item.item_code === itemCode);
    if (index !== -1) {
      onUpdateItem(index, 'quantity', quantity);
    }
  };

  const handleRemoveItem = (itemCode: string) => {
    const index = items.findIndex(item => item.item_code === itemCode);
    if (index !== -1) {
      onRemoveItem(index);
    }
  };

  // Convert ClaimItem[] to the format expected by ItemSearchSection
  const selectedItems = items.map(item => ({
    item_code: item.item_code,
    description: item.description,
    quantity: item.quantity
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Claim Items</h3>
        <p className="text-muted-foreground">
          Add the items you want to claim for damage, incorrect quantity, or other issues
        </p>
      </div>

      <ItemSearchSection
        selectedItems={selectedItems}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
      />
    </div>
  );
};

export default EnhancedClaimItemsSection;
