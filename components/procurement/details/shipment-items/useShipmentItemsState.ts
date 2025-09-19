
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';

export type EditableItem = ShipmentItem & {
  isNew?: boolean;
  isDeleted?: boolean;
};

export const useShipmentItemsState = (initialItems: ShipmentItem[], shipmentId?: string) => {
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    setEditableItems(initialItems.map(item => ({ ...item })));
  }, [initialItems]);

  const handleAddItem = () => {
    setEditableItems(prev => [
      ...prev,
      {
        id: uuidv4(),
        shipment_id: shipmentId || '',
        item_code: '',
        description: '',
        quantity: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isNew: true
      }
    ]);
  };

  const handleAddSearchItem = (item: { item_code: string; description: string }) => {
    if (!item || !item.item_code) {
      return;
    }
    
    // Check if the item is already in the list (including non-deleted items)
    const isDuplicate = editableItems.some(existingItem => 
      existingItem.item_code === item.item_code && !existingItem.isDeleted
    );

    if (isDuplicate) {
      return;
    }

    // If not a duplicate, add it to the state
    const newItem = {
      id: uuidv4(),
      shipment_id: shipmentId || '',
      item_code: item.item_code,
      description: item.description,
      quantity: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true
    };
    
    setEditableItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setEditableItems(prev => {
      const item = prev.find(i => i.id === id);
      
      if (item?.isNew) {
        return prev.filter(i => i.id !== id);
      }
      
      return prev.map(i => 
        i.id === id
          ? { ...i, isDeleted: true }
          : i
      );
    });
  };

  const handleItemChange = (id: string, field: keyof EditableItem, value: any) => {
    setEditableItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, [field]: value, updated_at: new Date().toISOString() }
          : item
      )
    );
  };

  return {
    editableItems: editableItems.filter(item => !item.isDeleted),
    handleAddItem,
    handleAddSearchItem,
    handleRemoveItem,
    handleItemChange
  };
};
