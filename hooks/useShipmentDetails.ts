
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Shipment } from '@/hooks/useShipments';

export interface ShipmentItem {
  id: string;
  shipment_id: string;
  item_code: string;
  description: string;
  quantity: number;
  base_unit_code?: string;
  direct_unit_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface ShipmentDetails {
  shipment: Shipment | null;
  items: ShipmentItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useShipmentDetails = (shipmentId: string | undefined): ShipmentDetails => {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [items, setItems] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShipmentDetails = useCallback(async () => {
    if (!shipmentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Clear cache to ensure fresh data
      await supabase.auth.refreshSession();
      
      // Fetch the shipment details
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (shipmentError) {
        throw shipmentError;
      }

      console.log('Fetched shipment data:', shipmentData);
      setShipment(shipmentData as Shipment);

      // Fetch the shipment items
      const { data: itemsData, error: itemsError } = await supabase
        .from('shipment_items')
        .select('*')
        .eq('shipment_id', shipmentId);

      if (itemsError) {
        throw itemsError;
      }

      setItems(itemsData as ShipmentItem[]);
    } catch (err) {
      console.error('Error fetching shipment details:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    fetchShipmentDetails();
  }, [fetchShipmentDetails]);

  return { shipment, items, loading, error, refetch: fetchShipmentDetails };
};
