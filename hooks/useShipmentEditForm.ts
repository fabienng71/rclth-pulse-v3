
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
      shipment_type: (shipment?.shipment_type as "Chill" | "Dry" | "Frozen") || "Dry",
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
    
    // Reset with new values
    form.reset({
      vendor_code: currentShipment.vendor_code || '',
      vendor_name: currentShipment.vendor_name || '',
      etd: etdDate,
      eta: etaDate,
      freight_forwarder: currentShipment.freight_forwarder || '',
      transport_mode: (currentShipment.transport_mode as "air" | "sea") || "sea",
      shipment_type: (currentShipment.shipment_type as "Chill" | "Dry" | "Frozen") || "Dry",
    });
  };

  const onSubmit = async (data: ShipmentFormValues) => {
    if (!shipment) return;
    
    try {
      setIsSubmitting(true);
      console.log('Submitting form data:', data);
      
      // Format dates for database, ensuring we preserve the exact date by using YYYY-MM-DD format
      const formatDateToYYYYMMDD = (date: Date | undefined) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const etdFormatted = formatDateToYYYYMMDD(data.etd);
      const etaFormatted = formatDateToYYYYMMDD(data.eta);
      
      console.log('Formatted dates for submission:', { etd: etdFormatted, eta: etaFormatted });
      
      const { error } = await supabase
        .from('shipments')
        .update({
          etd: etdFormatted,
          eta: etaFormatted,
          freight_forwarder: data.freight_forwarder || null,
          transport_mode: data.transport_mode || null,
          shipment_type: data.shipment_type || null,
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
