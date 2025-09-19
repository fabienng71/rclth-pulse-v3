
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import VendorSection from '../../create/form-sections/VendorSection';
import TransportSection from '../../create/form-sections/TransportSection';
import { useShipmentEditForm } from '@/hooks/useShipmentEditForm';
import type { Shipment } from '@/hooks/useShipments';

interface ShipmentEditFormProps {
  shipment: Shipment | null;
  onSuccess: () => void;
  onClose: () => void;
}

const ShipmentEditForm: React.FC<ShipmentEditFormProps> = ({ shipment, onSuccess, onClose }) => {
  const { form, onSubmit, isSubmitting } = useShipmentEditForm({ shipment, onSuccess, onClose });

  const handleVendorSelect = (vendor: { vendor_code: string, vendor_name: string }) => {
    form.setValue('vendor_code', vendor.vendor_code);
    form.setValue('vendor_name', vendor.vendor_name);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <VendorSection form={form} onVendorSelect={handleVendorSelect} />
        <TransportSection form={form} />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Shipment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShipmentEditForm;
