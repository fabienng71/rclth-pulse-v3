
import { useState } from 'react';
import { SampleRequestItem } from '@/services/sampleRequestService';
import { useItemsData } from '@/hooks/useItemsData';

export const useItemsManagement = (initialItems: SampleRequestItem[] = []) => {
  const [items, setItems] = useState<SampleRequestItem[]>(initialItems);
  const { items: itemsData } = useItemsData();
  
  // Add a new item from search
  const addItem = (newItem: SampleRequestItem) => {
    setItems(prev => [...prev, newItem]);
  };
  
  // Select item by code
  const selectItem = (itemCode: string) => {
    const selectedItem = itemsData.find(item => item.item_code === itemCode);
    
    if (selectedItem) {
      const newItem: SampleRequestItem = {
        item_code: selectedItem.item_code,
        description: selectedItem.description || selectedItem.item_code,
        quantity: 1,
        price: selectedItem.unit_price || undefined
      };
      
      addItem(newItem);
    }
  };
  
  // Add a new empty item
  const addEmptyItem = () => {
    setItems(prev => [
      ...prev, 
      { item_code: '', description: '', quantity: 1 }
    ]);
  };
  
  // Remove an item at specified index
  const removeItem = (index: number) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      return newItems;
    });
  };
  
  // Update item field
  const updateItemField = <K extends keyof SampleRequestItem>(
    index: number, 
    field: K, 
    value: SampleRequestItem[K]
  ) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };
  
  return {
    items,
    setItems,
    addItem,
    selectItem,
    addEmptyItem,
    removeItem,
    updateItemField
  };
};
