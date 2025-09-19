
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShipmentFormValues } from '@/types/shipment';

interface ShipmentItem {
  item_code: string;
  description: string;
  quantity: number;
  base_unit_code?: string;
  direct_unit_cost?: number;
}

interface CreateShipmentData extends ShipmentFormValues {
  items: ShipmentItem[];
}

export const useCreateShipment = () => {
  const [loading, setLoading] = useState(false);

  const createShipment = async (data: CreateShipmentData): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Creating shipment with data:', data);

      // Format dates for database
      const formatDateToYYYYMMDD = (date: Date | undefined) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const etdFormatted = formatDateToYYYYMMDD(data.etd);
      const etaFormatted = formatDateToYYYYMMDD(data.eta);

      console.log('Formatted dates - ETD:', etdFormatted, 'ETA:', etaFormatted);

      // Create the shipment - let Supabase auto-generate the ID and auto-create todo
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          vendor_code: data.vendor_code,
          vendor_name: data.vendor_name,
          freight_forwarder: data.freight_forwarder || null,
          transport_mode: data.transport_mode || null,
          shipment_type: data.shipment_type || null,
          etd: etdFormatted,
          eta: etaFormatted,
          status: 'pending' // This will trigger the auto-creation of todo
        } as any) // Type assertion to handle auto-generated id
        .select()
        .single();

      if (shipmentError) {
        console.error('Error creating shipment:', shipmentError);
        throw shipmentError;
      }

      console.log('Shipment created successfully:', shipmentData);

      // Create shipment items if any
      if (data.items && data.items.length > 0) {
        console.log('Creating shipment items:', data.items);
        
        const itemsData = data.items.map(item => ({
          shipment_id: shipmentData.id,
          item_code: item.item_code,
          description: item.description,
          quantity: item.quantity,
          base_unit_code: item.base_unit_code || null,
          direct_unit_cost: item.direct_unit_cost || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: itemsError } = await supabase
          .from('shipment_items')
          .insert(itemsData as any); // Type assertion to handle auto-generated id

        if (itemsError) {
          console.error('Error creating shipment items:', itemsError);
          throw itemsError;
        }

        console.log('Shipment items created successfully');
      }

      toast.success('Shipment created successfully');
      return true;
    } catch (error) {
      console.error('Error in createShipment:', error);
      toast.error('Failed to create shipment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createShipment, loading };
};
