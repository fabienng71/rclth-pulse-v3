import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuotationCreate } from './useQuotationCreate';
import { useQuotationUpdate } from './useQuotationUpdate';
import { FormData } from '@/components/quotations/types';
import { QuotationItemFormData } from '@/components/quotations/QuotationItemsTable';
import { QuotationWithItems } from '@/types/quotations';
import { supabase } from '@/integrations/supabase/client';

export const useQuotationSubmit = (
  existingQuotation?: QuotationWithItems,
  isEdit = false
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createQuotationWithItems } = useQuotationCreate();
  const { updateQuotationWithItems } = useQuotationUpdate();
  
  const validateItems = (items: QuotationItemFormData[]) => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item to the quotation.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };
  
  const addQuotationItems = async (quotationId: string, items: QuotationItemFormData[]) => {
    const { error } = await supabase
      .from('quotation_items')
      .insert(items.map(item => ({
        quotation_id: quotationId,
        item_code: item.item_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        unit_of_measure: item.unit_of_measure,
      })));
      
    if (error) {
      console.error('Error adding items:', error);
      throw error;
    }
  };
  
  const updateQuotationItem = async (itemId: string, item: QuotationItemFormData) => {
    const { error } = await supabase
      .from('quotation_items')
      .update({
        item_code: item.item_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        unit_of_measure: item.unit_of_measure,
      })
      .eq('id', itemId);
      
    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };
  
  const deleteQuotationItem = async (itemId: string) => {
    const { error } = await supabase
      .from('quotation_items')
      .delete()
      .eq('id', itemId);
      
    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };
  
  const handleCreateQuotation = async (
    data: FormData,
    items: QuotationItemFormData[]
  ) => {
    const result = await createQuotationWithItems(data, items);
    
    if (result) {
      await addQuotationItems(result.id, items);
    }
    
    navigate(`/quotations/${result.id}`);
  };
  
  const handleUpdateQuotation = async (
    data: FormData,
    items: QuotationItemFormData[],
    existingQuotation: QuotationWithItems
  ) => {
    await updateQuotationWithItems(data, existingQuotation);
    
    if (existingQuotation.items) {
      const existingIds = existingQuotation.items.map(item => item.id);
      const currentIds = items.filter(item => item.id).map(item => item.id) as string[];
      
      for (const id of existingIds) {
        if (!currentIds.includes(id)) {
          await deleteQuotationItem(id);
        }
      }
      
      const updatePromises = items
        .filter(item => item.id)
        .map(item => updateQuotationItem(item.id as string, item));
      
      const newItems = items.filter(item => !item.id);
      if (newItems.length > 0) {
        await addQuotationItems(existingQuotation.id, newItems);
      }
      
      await Promise.all(updatePromises);
    }
    
    navigate(`/quotations/${existingQuotation.id}`);
  };
  
  const onSubmit = async (data: FormData, items: QuotationItemFormData[]) => {
    if (!validateItems(items)) return;
    
    try {
      if (isEdit && existingQuotation) {
        await handleUpdateQuotation(data, items, existingQuotation);
      } else {
        await handleCreateQuotation(data, items);
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save quotation. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return {
    onSubmit,
  };
};
