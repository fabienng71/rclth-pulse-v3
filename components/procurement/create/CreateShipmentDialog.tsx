
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShipmentForm } from './ShipmentForm';
import { useCreateShipment } from '@/hooks/useCreateShipment';

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateShipmentDialog: React.FC<CreateShipmentDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { createShipment, loading } = useCreateShipment();

  const handleSubmit = async (formData: any) => {
    const success = await createShipment(formData);
    if (success) {
      onOpenChange(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Shipment</DialogTitle>
        </DialogHeader>
        
        <ShipmentForm onSubmit={handleSubmit} isLoading={loading} />
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShipmentDialog;
