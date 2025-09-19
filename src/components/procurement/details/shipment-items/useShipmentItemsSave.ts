
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { EditableItem } from './useShipmentItemsState';

export function useShipmentItemsSave() {
  const saveShipmentItems = async (
    shipmentId: string | undefined,
    editableItems: EditableItem[],
    originalItems: any[],
    onSuccess: () => void
  ) => {
    if (!shipmentId) return;

    try {
      // Process all items
      const itemsToCreate = editableItems.filter(item => item.isNew);
      const itemsToUpdate = editableItems.filter(item => !item.isNew);
      
      // Handle new items
      if (itemsToCreate.length > 0) {
        const { error: createError } = await supabase
          .from('shipment_items')
          .insert(
            itemsToCreate.map(item => ({
              id: uuidv4(), // Generate a UUID for each new item
              shipment_id: shipmentId,
              item_code: item.item_code,
              description: item.description,
              quantity: item.quantity,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))
          );
        
        if (createError) throw createError;
      }
      
      // Handle existing items (updates)
      for (const item of itemsToUpdate) {
        const { error: updateError } = await supabase
          .from('shipment_items')
          .update({
            item_code: item.item_code,
            description: item.description,
            quantity: item.quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
        
        if (updateError) throw updateError;
      }
      
      // Handle deleted items
      const itemsInOriginalList = new Set(originalItems.map(item => item.id));
      const itemsInEditableList = new Set(editableItems.map(item => item.id));
      
      const itemsToDelete = [...itemsInOriginalList].filter(id => !itemsInEditableList.has(id));
      
      if (itemsToDelete.length > 0) {
        for (const id of itemsToDelete) {
          const { error: deleteError } = await supabase
            .from('shipment_items')
            .delete()
            .eq('id', id);
          
          if (deleteError) throw deleteError;
        }
      }
      
      toast.success('Shipment items updated successfully');
      onSuccess();
      return true;
    } catch (error) {
      console.error('Error updating shipment items:', error);
      toast.error('Failed to update shipment items');
      return false;
    }
  };

  return { saveShipmentItems };
}
