
import React from 'react';
import type { Shipment } from '@/hooks/useShipments';
import { useSortableTable } from '@/hooks/useSortableTable';

// Components
import EmptyShipments from './empty/EmptyShipments';
import LoadingShipments from './loading/LoadingShipments';
import NoShipmentsFound from './table/NoShipmentsFound';
import TableFiltersBar from './table/TableFiltersBar';
import TableContainer from './table/TableContainer';

// Hooks
import { useShipmentFilters } from '@/hooks/useShipmentFilters';

interface ShipmentTableProps {
  shipments: Shipment[];
  loading: boolean;
  refetch: () => void;
  showArchived: boolean;
  toggleArchived: () => void;
  weekFilter?: string | null;
  setWeekFilter?: (filter: string | null) => void;
}

type SortableField = 'vendor_name' | 'transport_mode' | 'etd' | 'eta' | 'created_at' | 'status';

const ShipmentTable: React.FC<ShipmentTableProps> = ({ 
  shipments, 
  loading, 
  refetch,
  showArchived,
  toggleArchived,
  weekFilter,
  setWeekFilter
}) => {
  const { sortField, sortDirection, handleSort } = useSortableTable<SortableField>('created_at');
  
  const {
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
  } = useShipmentFilters(shipments, sortField, sortDirection);

  if (loading) {
    return <LoadingShipments />;
  }

  if (!shipments.length) {
    return <EmptyShipments />;
  }

  const isFiltered = 
    Boolean(transportModeFilter && transportModeFilter !== 'all') || 
    Boolean(statusFilter && statusFilter !== 'all') ||
    Boolean(selectedVendorCode) ||
    Boolean(etdFrom) ||
    Boolean(etdTo) ||
    Boolean(etaFrom) ||
    Boolean(etaTo) ||
    Boolean(weekFilter);

  if (filteredAndSortedShipments.length === 0) {
    return (
      <div>
        <TableFiltersBar
          transportModeFilter={transportModeFilter}
          statusFilter={statusFilter}
          selectedVendorCode={selectedVendorCode}
          etdFrom={etdFrom}
          etdTo={etdTo}
          etaFrom={etaFrom}
          etaTo={etaTo}
          setTransportModeFilter={setTransportModeFilter}
          setStatusFilter={setStatusFilter}
          setSelectedVendorCode={setSelectedVendorCode}
          setEtdFrom={setEtdFrom}
          setEtdTo={setEtdTo}
          setEtaFrom={setEtaFrom}
          setEtaTo={setEtaTo}
          clearAllFilters={clearAllFilters}
          showArchived={showArchived}
          toggleArchived={toggleArchived}
          weekFilter={weekFilter}
          setWeekFilter={setWeekFilter}
        />
        <NoShipmentsFound 
          isFiltered={isFiltered}
          showArchived={showArchived}
          onShowActiveShipments={() => {
            if (showArchived) toggleArchived();
          }} 
        />
      </div>
    );
  }

  return (
    <div>
      <TableFiltersBar
        transportModeFilter={transportModeFilter}
        statusFilter={statusFilter}
        selectedVendorCode={selectedVendorCode}
        etdFrom={etdFrom}
        etdTo={etdTo}
        etaFrom={etaFrom}
        etaTo={etaTo}
        setTransportModeFilter={setTransportModeFilter}
        setStatusFilter={setStatusFilter}
        setSelectedVendorCode={setSelectedVendorCode}
        setEtdFrom={setEtdFrom}
        setEtdTo={setEtdTo}
        setEtaFrom={setEtaFrom}
        setEtaTo={setEtaTo}
        clearAllFilters={clearAllFilters}
        showArchived={showArchived}
        toggleArchived={toggleArchived}
        weekFilter={weekFilter}
        setWeekFilter={setWeekFilter}
      />
      <TableContainer
        shipments={filteredAndSortedShipments}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSort}
        refetch={refetch}
      />
    </div>
  );
};

export default ShipmentTable;
