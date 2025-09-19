
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shipment } from '@/hooks/useShipments';
import { toast } from 'sonner';

export const useShipmentRowActions = (shipment: Shipment, refetch: () => void) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      
      const { error: itemsError } = await supabase
        .from('shipment_items')
        .delete()
        .eq('shipment_id', shipment.id);
        
      if (itemsError) throw itemsError;
      
      const { error: shipmentError } = await supabase
        .from('shipments')
        .delete()
        .eq('id', shipment.id);
        
      if (shipmentError) throw shipmentError;
      
      toast.success('Shipment deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast.error('Failed to delete shipment');
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleArchiveToggle = async () => {
    try {
      setIsProcessing(true);
      
      const newArchiveStatus = !shipment.archive;
      
      const { error } = await supabase
        .from('shipments')
        .update({ archive: newArchiveStatus })
        .eq('id', shipment.id);
        
      if (error) throw error;
      
      const actionText = newArchiveStatus ? 'archived' : 'unarchived';
      toast.success(`Shipment ${actionText} successfully`);
      refetch();
    } catch (error) {
      console.error('Error toggling shipment archive status:', error);
      toast.error('Failed to update shipment archive status');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    isProcessing,
    handleDelete,
    handleArchiveToggle
  };
};
