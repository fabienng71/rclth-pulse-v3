
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Shipment } from '@/hooks/useShipments';
import { ShipmentFormValues } from '@/types/shipment';
import { zodResolver } from '@hookform/resolvers/zod';
import { shipmentFormSchema } from '@/types/shipment';

interface UseShipmentEditFormProps {
  shipment: Shipment | null;
  onSuccess: () => void;
  onClose: () => void;
}

export const useShipmentEditForm = ({ shipment, onSuccess, onClose }: UseShipmentEditFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      vendor_code: shipment?.vendor_code || '',
      vendor_name: shipment?.vendor_name || '',
      etd: shipment?.etd ? new Date(shipment.etd) : undefined,
      eta: shipment?.eta ? new Date(shipment.eta) : undefined,
      freight_forwarder: shipment?.freight_forwarder || '',
      transport_mode: (shipment?.transport_mode as "air" | "sea") || "sea",
    },
    mode: 'onChange'
  });

  // Reset form when shipment changes
  const resetForm = (currentShipment: Shipment | null) => {
    if (!currentShipment) return;

    // Parse dates correctly
    const etdDate = currentShipment.etd ? new Date(currentShipment.etd) : undefined;
    const etaDate = currentShipment.eta ? new Date(currentShipment.eta) : undefined;
    
    console.log('Resetting form with dates:', { 
      etd: etdDate, 
      eta: etaDate,
      etdOriginal: currentShipment.etd,
      etaOriginal: currentShipment.eta
    });
    
    form.reset({
      vendor_code: currentShipment.vendor_code || '',
      vendor_name: currentShipment.vendor_name || '',
      etd: etdDate,
      eta: etaDate,
      freight_forwarder: currentShipment.freight_forwarder || '',
      transport_mode: (currentShipment.transport_mode as "air" | "sea") || "sea",
    }, {
      keepDirty: false,
      keepTouched: false,
      keepIsValid: false,
      keepErrors: false,
    });
  };

  const onSubmit = async (data: ShipmentFormValues) => {
    if (!shipment) return;
    
    try {
      setIsSubmitting(true);
      console.log('Submitting form data:', data);
      
      // Format dates for database
      const etdFormatted = data.etd ? data.etd.toISOString().split('T')[0] : null;
      const etaFormatted = data.eta ? data.eta.toISOString().split('T')[0] : null;
      
      console.log('Formatted dates for submission:', { etd: etdFormatted, eta: etaFormatted });
      
      const { error } = await supabase
        .from('shipments')
        .update({
          etd: etdFormatted,
          eta: etaFormatted,
          freight_forwarder: data.freight_forwarder || null,
          transport_mode: data.transport_mode || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipment.id);

      if (error) {
        console.error('Error updating shipment:', error);
        throw error;
      }
      
      toast.success('Shipment updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast.error('Failed to update shipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    resetForm,
    onSubmit,
    isSubmitting
  };
};
