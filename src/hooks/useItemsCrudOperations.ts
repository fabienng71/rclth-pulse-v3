import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ItemFormData {
  item_code: string;
  description: string;
  posting_group: string;
  base_unit_code: string;
  unit_price: number;
  vendor_code: string;
  brand: string;
  attribut_1: string;
  pricelist: boolean;
}

interface UseItemsCrudOperationsProps {
  onSuccess: () => void;
  onCreateSuccess: () => void;
  resetFormData: () => void;
}

export const useItemsCrudOperations = ({ 
  onSuccess, 
  onCreateSuccess, 
  resetFormData 
}: UseItemsCrudOperationsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleCreateItem = async (formData: ItemFormData) => {
    try {
      const { error } = await supabase
        .from('items')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item created successfully",
      });

      onCreateSuccess();
      resetFormData();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEditItem = async (editingItem: ItemFormData) => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('items')
        .update(editingItem)
        .eq('item_code', editingItem.item_code);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item updated successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteItem = async (itemCode: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('item_code', itemCode);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleCreateItem,
    handleEditItem,
    handleDeleteItem,
  };
};