
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export interface Shipment {
  id: string;
  vendor_code: string;
  vendor_name: string;
  etd: string | null;
  eta: string | null;
  freight_forwarder: string | null;
  status: string | null;
  shipment_type: string | null;
  created_at: string;
  updated_at: string;
  transport_mode: string | null;
  archive: boolean | null;
}

export const useShipments = (fetchAll: boolean = false) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [weekFilter, setWeekFilter] = useState<string | null>(null);

  const setInitialArchived = (archived: boolean) => {
    setShowArchived(archived);
  };

  const filterShipmentsByWeek = (shipments: Shipment[]): Shipment[] => {
    if (weekFilter !== 'this-week') return shipments;
    
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday end
    
    return shipments.filter(shipment => {
      if (!shipment.eta) return false;
      try {
        const etaDate = parseISO(shipment.eta);
        return isWithinInterval(etaDate, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    });
  };

  const fetchShipments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      // If fetchAll is true (for dashboard), get all shipments
      if (fetchAll) {
        // No filter - get everything
      } else {
        // Normal filtering behavior for shipment list page
        if (showArchived) {
          query = query.eq('archive', true);
        } else {
          query = query.or('archive.is.null,archive.eq.false');
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let filteredData = data || [];
      
      // Apply week filter if needed
      if (weekFilter === 'this-week') {
        filteredData = filterShipmentsByWeek(filteredData);
      }

      setShipments(filteredData);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const toggleShowArchived = () => {
    setShowArchived(prev => !prev);
    setWeekFilter(null); // Clear week filter when toggling archive
  };

  useEffect(() => {
    fetchShipments();
  }, [showArchived, fetchAll, weekFilter]);

  return { 
    shipments, 
    loading, 
    error, 
    refetch: fetchShipments, 
    showArchived, 
    toggleShowArchived,
    setInitialArchived,
    weekFilter,
    setWeekFilter
  };
};
