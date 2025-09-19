
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';
import { ShipmentItemsForm } from './shipment-items/ShipmentItemsForm';
import { useShipmentItemsState } from './shipment-items/useShipmentItemsState';
import { useShipmentItemsSave } from './shipment-items/useShipmentItemsSave';
import { toast } from 'sonner';

type EditShipmentItemsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentId: string | undefined;
  items: ShipmentItem[];
  onSuccess: () => void;
};

const EditShipmentItemsDialog: React.FC<EditShipmentItemsDialogProps> = ({
  open,
  onOpenChange,
  shipmentId,
  items,
  onSuccess
}) => {
  const {
    editableItems,
    handleAddItem,
    handleAddSearchItem,
    handleRemoveItem,
    handleItemChange
  } = useShipmentItemsState(items, shipmentId);
  
  const { saveShipmentItems } = useShipmentItemsSave();

  useEffect(() => {
    // Reset state when dialog opens
    if (open && items) {
      // This will be handled by the useEffect in useShipmentItemsState
    }
  }, [open, items]);

  const handleSave = async () => {
    if (!shipmentId) {
      toast.error('Missing shipment ID');
      return;
    }
    
    const success = await saveShipmentItems(shipmentId, editableItems, items, onSuccess);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Shipment Items</DialogTitle>
          <DialogDescription>
            Add, edit or remove items from this shipment
          </DialogDescription>
        </DialogHeader>
        
        <ShipmentItemsForm
          items={items}
          editableItems={editableItems}
          onAddItem={handleAddItem}
          onAddSearchItem={handleAddSearchItem}
          onRemoveItem={handleRemoveItem}
          onItemChange={handleItemChange}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditShipmentItemsDialog;
