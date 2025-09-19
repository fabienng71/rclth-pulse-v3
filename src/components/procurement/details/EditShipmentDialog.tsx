
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import type { Shipment } from '@/hooks/useShipments';
import { useShipmentEditForm } from './hooks/useShipmentEditForm';
import DatePickerField from './components/DatePickerField';
import TransportModeField from './components/TransportModeField';
import FreightForwarderField from './components/FreightForwarderField';

type EditShipmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
  onSuccess: () => void;
};

const EditShipmentDialog: React.FC<EditShipmentDialogProps> = ({ 
  open, 
  onOpenChange, 
  shipment, 
  onSuccess 
}) => {
  const { form, resetForm, onSubmit, isSubmitting } = useShipmentEditForm({
    shipment,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  // This effect needs to run when the dialog opens or the shipment changes
  useEffect(() => {
    if (open && shipment) {
      console.log('Resetting form with shipment:', shipment);
      resetForm(shipment);
    }
  }, [open, shipment, resetForm]);

  const handleFormSubmit = async (data: any) => {
    console.log('Form submitted with data:', data);
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Shipment Details</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              {/* ETD Date Picker */}
              <DatePickerField 
                form={form} 
                name="etd" 
                label="Estimated Departure (ETD)" 
                disabled={isSubmitting}
              />

              {/* ETA Date Picker */}
              <DatePickerField 
                form={form} 
                name="eta" 
                label="Estimated Arrival (ETA)" 
                disabled={isSubmitting}
              />
            </div>

            {/* Freight Forwarder */}
            <FreightForwarderField 
              control={form.control} 
              disabled={isSubmitting}
            />

            {/* Transport Mode */}
            <TransportModeField 
              control={form.control} 
              disabled={isSubmitting}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditShipmentDialog;
