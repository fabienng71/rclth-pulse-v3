
import { useState, useMemo } from 'react';
import type { Shipment } from '@/hooks/useShipments';
import { determineShipmentStatus } from '@/components/procurement/utils/shipmentUtils';

export const useShipmentFilters = (
  shipments: Shipment[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
) => {
  const [transportModeFilter, setTransportModeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedVendorCode, setSelectedVendorCode] = useState<string | null>(null);
  const [etdFrom, setEtdFrom] = useState<Date | null>(null);
  const [etdTo, setEtdTo] = useState<Date | null>(null);
  const [etaFrom, setEtaFrom] = useState<Date | null>(null);
  const [etaTo, setEtaTo] = useState<Date | null>(null);

  const filteredAndSortedShipments = useMemo(() => {
    let filtered = [...shipments];
    
    // Transport mode filter
    if (transportModeFilter && transportModeFilter !== 'all') {
      filtered = filtered.filter(s => 
        s.transport_mode?.toLowerCase() === transportModeFilter.toLowerCase()
      );
    }
    
    // Status filter - always use calculated status instead of database status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(shipment => {
        const calculatedStatus = determineShipmentStatus(shipment.etd, shipment.eta);
        return calculatedStatus === statusFilter;
      });
    }

    // Vendor filter
    if (selectedVendorCode && selectedVendorCode !== 'all') {
      filtered = filtered.filter(s => s.vendor_code === selectedVendorCode);
    }

    // ETD date range filter
    if (etdFrom || etdTo) {
      filtered = filtered.filter(shipment => {
        if (!shipment.etd) return false;
        const etdDate = new Date(shipment.etd);
        
        if (etdFrom && etdDate < etdFrom) return false;
        if (etdTo && etdDate > etdTo) return false;
        
        return true;
      });
    }

    // ETA date range filter
    if (etaFrom || etaTo) {
      filtered = filtered.filter(shipment => {
        if (!shipment.eta) return false;
        const etaDate = new Date(shipment.eta);
        
        if (etaFrom && etaDate < etaFrom) return false;
        if (etaTo && etaDate > etaTo) return false;
        
        return true;
      });
    }
    
    return filtered.sort((a, b) => {
      let first: any = a[sortField as keyof Shipment];
      let second: any = b[sortField as keyof Shipment];
      
      if (sortField === 'etd' || sortField === 'eta' || sortField === 'created_at') {
        first = first ? new Date(first).getTime() : 0;
        second = second ? new Date(second).getTime() : 0;
      }
      
      if (typeof first === 'string' && typeof second === 'string') {
        return sortDirection === 'asc' 
          ? first.localeCompare(second) 
          : second.localeCompare(first);
      }
      
      if (first === null) return sortDirection === 'asc' ? -1 : 1;
      if (second === null) return sortDirection === 'asc' ? 1 : -1;
      
      return sortDirection === 'asc' 
        ? (first < second ? -1 : 1) 
        : (first > second ? -1 : 1);
    });
  }, [shipments, transportModeFilter, statusFilter, selectedVendorCode, etdFrom, etdTo, etaFrom, etaTo, sortField, sortDirection]);

  const clearAllFilters = () => {
    setTransportModeFilter(null);
    setStatusFilter(null);
    setSelectedVendorCode(null);
    setEtdFrom(null);
    setEtdTo(null);
    setEtaFrom(null);
    setEtaTo(null);
  };

  return {
    transportModeFilter,
    statusFilter,
    selectedVendorCode,
    etdFrom,
    etdTo,
    etaFrom,
    etaTo,
    setTransportModeFilter,
    setStatusFilter,
    setSelectedVendorCode,
    setEtdFrom,
    setEtdTo,
    setEtaFrom,
    setEtaTo,
    clearAllFilters,
    filteredAndSortedShipments
  };
};

export type ShipmentFiltersType = ReturnType<typeof useShipmentFilters>;
