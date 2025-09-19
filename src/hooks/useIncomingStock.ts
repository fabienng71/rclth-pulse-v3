
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Shipment } from '@/hooks/useShipments';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';
import { determineShipmentStatus } from '@/components/procurement/utils/shipmentUtils';

export interface ShipmentWithItems extends Shipment {
  itemsCount: number;
  itemsDescription: string;
  items: ShipmentItem[];
}

export interface VendorGroup {
  vendorCode: string;
  vendorName: string;
  shipments: ShipmentWithItems[];
  totalShipments: number;
  totalItems: number;
  urgentShipments: number;
}

export const useIncomingStock = () => {
  const [shipments, setShipments] = useState<ShipmentWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransportMode, setSelectedTransportMode] = useState<string>('all');

  const fetchIncomingStock = async () => {
    try {
      setLoading(true);
      
      // Fetch all active shipments
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*')
        .or('archive.is.null,archive.eq.false')
        .order('created_at', { ascending: false });

      if (shipmentsError) {
        throw shipmentsError;
      }

      // Filter shipments to only include pending and in_transit based on calculated status
      const filteredShipments = (shipmentsData || []).filter(shipment => {
        const calculatedStatus = determineShipmentStatus(shipment.etd, shipment.eta);
        return calculatedStatus === 'pending' || calculatedStatus === 'in_transit';
      });

      // Fetch items for each shipment
      const shipmentsWithItems: ShipmentWithItems[] = await Promise.all(
        filteredShipments.map(async (shipment) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('shipment_items')
            .select('*')
            .eq('shipment_id', shipment.id);

          if (itemsError) {
            console.error('Error fetching items for shipment:', shipment.id, itemsError);
            return {
              ...shipment,
              itemsCount: 0,
              itemsDescription: 'Error loading items',
              items: []
            };
          }

          const items = itemsData || [];
          const itemsCount = items.length;
          const itemsDescription = items.map(item => 
            `${item.item_code} (${item.quantity})`
          ).join(', ') || 'No items';

          return {
            ...shipment,
            itemsCount,
            itemsDescription: itemsDescription.length > 100 
              ? itemsDescription.substring(0, 100) + '...' 
              : itemsDescription,
            items
          };
        })
      );

      setShipments(shipmentsWithItems);
    } catch (err) {
      console.error('Error fetching incoming stock:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomingStock();
  }, []);

  // Group shipments by vendor and apply filters
  const vendorGroups = useMemo(() => {
    let filtered = shipments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.vendor_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply transport mode filter
    if (selectedTransportMode && selectedTransportMode !== 'all') {
      filtered = filtered.filter(shipment =>
        shipment.transport_mode === selectedTransportMode
      );
    }

    // Group by vendor
    const groups = filtered.reduce((acc, shipment) => {
      const key = shipment.vendor_code;
      if (!acc[key]) {
        acc[key] = {
          vendorCode: shipment.vendor_code,
          vendorName: shipment.vendor_name,
          shipments: [],
          totalShipments: 0,
          totalItems: 0,
          urgentShipments: 0
        };
      }
      
      acc[key].shipments.push(shipment);
      acc[key].totalShipments++;
      acc[key].totalItems += shipment.itemsCount;
      
      // Count urgent shipments (arriving within 3 days or overdue)
      if (shipment.eta) {
        const etaDate = new Date(shipment.eta);
        const today = new Date();
        const diffDays = Math.ceil((etaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          acc[key].urgentShipments++;
        }
      }
      
      return acc;
    }, {} as Record<string, VendorGroup>);

    return Object.values(groups).sort((a, b) => a.vendorName.localeCompare(b.vendorName));
  }, [shipments, searchTerm, selectedTransportMode]);

  return {
    vendorGroups,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedTransportMode,
    setSelectedTransportMode,
    refetch: fetchIncomingStock
  };
};
