
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Customer, useCustomersData } from '@/hooks/useCustomersData';
import { Item, useItemsData } from '@/hooks/useItemsData';
import { returnFormSchema, ReturnFormValues } from '../returnFormSchema';

export const useReturnFormState = (initialData?: Partial<ReturnFormValues>) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { customers } = useCustomersData();
  const { items } = useItemsData();

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      customerCode: initialData?.customerCode || '',
      productCode: initialData?.productCode || '',
      returnQuantity: initialData?.returnQuantity || 1,
      returnDate: initialData?.returnDate || new Date(),
      reason: initialData?.reason || '',
      comment: initialData?.comment || '',
      unit: initialData?.unit || '',
    },
  });

  const handleCustomerSelect = (customerCode: string) => {
    form.setValue("customerCode", customerCode);
    const customer = customers?.find(c => c.customer_code === customerCode) || null;
    setSelectedCustomer(customer);
  };

  const handleItemSelect = (itemCode: string) => {
    form.setValue("productCode", itemCode);
    const item = items?.find(i => i.item_code === itemCode) || null;
    setSelectedItem(item);
    
    // When an item is selected, update the unit field
    if (item && item.base_unit_code) {
      form.setValue("unit", item.base_unit_code);
    }
  };

  const onReasonChange = (value: string) => {
    form.setValue("reason", value);
  };

  return {
    form,
    selectedCustomer,
    selectedItem,
    isSubmitting,
    setIsSubmitting,
    isSavingDraft,
    setIsSavingDraft,
    handleCustomerSelect,
    handleItemSelect,
    onReasonChange,
    setSelectedCustomer,
    setSelectedItem
  };
};
