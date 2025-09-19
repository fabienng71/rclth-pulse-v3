
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuotationItemInsert, QuotationItemUpdate, QuotationItem } from '@/types/quotations';
import { useToast } from '@/hooks/use-toast';

export const useQuotationItems = (quotationId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create a new quotation item
  const addItem = useMutation({
    mutationFn: async (item: QuotationItemInsert) => {
      const { data, error } = await supabase
        .from('quotation_items')
        .insert([{
          ...item,
          quotation_id: quotationId,
        }])
        .select('*')
        .single();
        
      if (error) {
        console.error('Error adding item to quotation:', error);
        toast({
          title: 'Error',
          description: 'Failed to add item to quotation',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as QuotationItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
    },
  });
  
  // Update an existing quotation item
  const updateItem = useMutation({
    mutationFn: async ({ id, item }: { id: string, item: QuotationItemUpdate }) => {
      const { data, error } = await supabase
        .from('quotation_items')
        .update(item)
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error updating quotation item:', error);
        toast({
          title: 'Error',
          description: 'Failed to update item',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as QuotationItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
    },
  });
  
  // Delete a quotation item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotation_items')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting quotation item:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete item',
          variant: 'destructive',
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
    },
  });
  
  // Add multiple items at once
  const addItems = useMutation({
    mutationFn: async (items: QuotationItemInsert[]) => {
      const itemsWithQuotationId = items.map(item => ({
        ...item,
        quotation_id: quotationId
      }));
      
      const { data, error } = await supabase
        .from('quotation_items')
        .insert(itemsWithQuotationId)
        .select('*');
        
      if (error) {
        console.error('Error adding items to quotation:', error);
        toast({
          title: 'Error',
          description: 'Failed to add items to quotation',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as QuotationItem[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
    },
  });
  
  return {
    addItem,
    updateItem,
    deleteItem,
    addItems,
  };
};
