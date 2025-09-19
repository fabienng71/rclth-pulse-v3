
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCustomersData } from '@/hooks/useCustomersData';
import { QuotationItemFormData } from '@/components/quotations/QuotationItemsTable';
import { QuotationWithItems } from '@/types/quotations';
import { FormData } from '@/components/quotations/types';

export const useQuotationFormState = (existingQuotation?: QuotationWithItems) => {
  const [items, setItems] = useState<QuotationItemFormData[]>([]);
  const { customers } = useCustomersData();
  
  // Initialize form with existing data or defaults
  const form = useForm<FormData>({
    defaultValues: {
      title: existingQuotation?.title || '',
      customer_code: existingQuotation?.customer_code || '',
      customer_name: existingQuotation?.customer_name || '',
      customer_address: existingQuotation?.customer_address || '',
      salesperson_code: existingQuotation?.salesperson_code || '',
      validity_days: existingQuotation?.validity_days || 15,
      payment_terms: existingQuotation?.payment_terms || '30 days',
      notes: existingQuotation?.notes || '',
      status: existingQuotation?.status || 'sent',
      is_lead: existingQuotation?.is_lead || false,
      lead_id: existingQuotation?.lead_id || '',
      lead_name: existingQuotation?.lead_name || ''
    },
  });
  
  // Load existing items when in edit mode
  useEffect(() => {
    if (existingQuotation?.items) {
      setItems(
        existingQuotation.items.map((item) => ({
          id: item.id,
          item_code: item.item_code,
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount_percent: Number(item.discount_percent || 0),
          unit_of_measure: item.unit_of_measure,
        }))
      );
    }
  }, [existingQuotation]);
  
  // Handle customer selection
  const handleCustomerChange = (customerId: string) => {
    if (customerId === "no_customer") {
      form.setValue('customer_name', '');
      form.setValue('customer_address', '');
      return;
    }
    
    // Find the selected customer in the customers array
    const selectedCustomer = customers.find(c => c.customer_code === customerId);
    if (selectedCustomer) {
      // Update the customer name field with the selected customer's name
      form.setValue('customer_name', selectedCustomer.customer_name);
      // We could also fetch and set address if it was available in the customers data
    }
  };
  
  return {
    form,
    items,
    setItems,
    handleCustomerChange,
  };
};
