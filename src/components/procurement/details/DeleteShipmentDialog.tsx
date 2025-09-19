
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DeleteShipmentDialogProps {
  shipmentId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteShipmentDialog: React.FC<DeleteShipmentDialogProps> = ({ 
  shipmentId, 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!shipmentId) return;
    
    try {
      setIsDeleting(true);
      
      // First delete all shipment items
      const { error: itemsError } = await supabase
        .from('shipment_items')
        .delete()
        .eq('shipment_id', shipmentId);
        
      if (itemsError) throw itemsError;
      
      // Then delete the shipment itself
      const { error: shipmentError } = await supabase
        .from('shipments')
        .delete()
        .eq('id', shipmentId);
        
      if (shipmentError) throw shipmentError;
      
      toast.success('Shipment deleted successfully');
      navigate('/procurement');
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast.error('Failed to delete shipment');
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this shipment?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the shipment and all its items from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete Shipment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteShipmentDialog;
