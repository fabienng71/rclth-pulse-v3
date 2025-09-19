
import { useState } from 'react';
import { Item } from '@/hooks/useItemsData';
import { QuotationItemFormData } from '@/components/quotations/QuotationItemsTable';

export function useQuotationItemsTable(
  initialItems: QuotationItemFormData[],
  onChange: (items: QuotationItemFormData[]) => void
) {
  
  const addNewItem = () => {
    onChange([
      ...initialItems,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        discount_percent: 0,
      },
    ]);
  };
  
  const updateItem = (index: number, field: keyof QuotationItemFormData, value: any) => {
    const updatedItems = [...initialItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onChange(updatedItems);
  };
  
  const removeItem = (index: number) => {
    const updatedItems = initialItems.filter((_, i) => i !== index);
    onChange(updatedItems);
  };
  
  const calculateLineTotal = (item: QuotationItemFormData) => {
    return item.quantity * item.unit_price * (1 - item.discount_percent / 100);
  };

  const selectItem = (selectedProduct: Item) => {
    // Add the item to the list using the provided item data
    onChange([
      ...initialItems,
      {
        item_code: selectedProduct.item_code,
        description: selectedProduct.description || '',
        quantity: 1,
        unit_price: selectedProduct.unit_price || 0,
        discount_percent: 0,
        unit_of_measure: selectedProduct.base_unit_code,
      },
    ]);
  };

  return {
    addNewItem,
    updateItem,
    removeItem,
    calculateLineTotal,
    selectItem
  };
}
