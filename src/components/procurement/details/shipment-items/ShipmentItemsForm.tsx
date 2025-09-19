
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ShipmentItemsTable } from './ShipmentItemsTable';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';
import ItemSearchBar from './ItemSearchBar';
import { EditableItem } from './useShipmentItemsState';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface ShipmentItemsFormProps {
  items: ShipmentItem[];
  onAddItem: () => void;
  onAddSearchItem: (item: { item_code: string, description: string }) => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof EditableItem, value: any) => void;
  editableItems: EditableItem[];
}

export const ShipmentItemsForm: React.FC<ShipmentItemsFormProps> = ({
  editableItems,
  onAddItem,
  onAddSearchItem,
  onRemoveItem,
  onItemChange
}) => {
  const handleItemSelect = (item: { item_code: string, description: string }) => {
    if (!item || !item.item_code) {
      toast.error('Invalid item: missing item code');
      return;
    }
    
    // Check if item is already in the list
    const isDuplicate = editableItems.some(existingItem => 
      existingItem.item_code === item.item_code
    );
    
    if (isDuplicate) {
      toast.warning(`Item ${item.item_code} is already in the shipment`);
      return;
    }
    
    // Add the new item
    onAddSearchItem(item);
    toast.success(`Added ${item.item_code} to shipment`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">Search for items to add</h4>
        <ItemSearchBar onItemSelect={handleItemSelect} />
      </Card>
      
      <div className="border rounded-md overflow-hidden">
        <ShipmentItemsTable 
          items={editableItems} 
          onRemoveItem={onRemoveItem}
          onItemChange={onItemChange}
        />
      </div>

      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={onAddItem}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Blank Item
      </Button>
    </div>
  );
};
