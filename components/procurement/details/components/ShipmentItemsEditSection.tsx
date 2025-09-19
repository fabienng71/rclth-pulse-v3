
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck, X } from 'lucide-react';
import { ShipmentItemsForm } from '../shipment-items/ShipmentItemsForm';
import { EditableItem } from '../shipment-items/useShipmentItemsState';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';

interface ShipmentItemsEditSectionProps {
  items: ShipmentItem[];
  editableItems: EditableItem[];
  onAddItem: () => void;
  onAddSearchItem: (item: { item_code: string, description: string }) => void;
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof EditableItem, value: any) => void;
  onSaveItems: () => Promise<void>;
  onCancelEdit: () => void;
}

const ShipmentItemsEditSection: React.FC<ShipmentItemsEditSectionProps> = ({
  items,
  editableItems,
  onAddItem,
  onAddSearchItem,
  onRemoveItem,
  onItemChange,
  onSaveItems,
  onCancelEdit
}) => {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Edit Shipment Items</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancelEdit}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={onSaveItems}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      
      <ShipmentItemsForm
        items={items}
        editableItems={editableItems}
        onAddItem={onAddItem}
        onAddSearchItem={onAddSearchItem}
        onRemoveItem={onRemoveItem}
        onItemChange={onItemChange}
      />
    </div>
  );
};

export default ShipmentItemsEditSection;
