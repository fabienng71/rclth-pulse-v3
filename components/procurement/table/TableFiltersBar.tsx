
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, X } from 'lucide-react';
import ShipmentFilters from '../filters/ShipmentFilters';
import ArchiveToggleButton from './ArchiveToggleButton';
import VendorSearch from '../search/VendorSearch';

interface TableFiltersBarProps {
  transportModeFilter: string | null;
  statusFilter: string | null;
  selectedVendorCode: string | null;
  etdFrom: Date | null;
  etdTo: Date | null;
  etaFrom: Date | null;
  etaTo: Date | null;
  setTransportModeFilter: (value: string | null) => void;
  setStatusFilter: (value: string | null) => void;
  setSelectedVendorCode: (value: string | null) => void;
  setEtdFrom: (date: Date | null) => void;
  setEtdTo: (date: Date | null) => void;
  setEtaFrom: (date: Date | null) => void;
  setEtaTo: (date: Date | null) => void;
  clearAllFilters: () => void;
  showArchived: boolean;
  toggleArchived: () => void;
  weekFilter?: string | null;
  setWeekFilter?: (filter: string | null) => void;
}

const TableFiltersBar: React.FC<TableFiltersBarProps> = ({
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
  showArchived,
  toggleArchived,
  weekFilter,
  setWeekFilter
}) => {
  const handleClearWeekFilter = () => {
    if (setWeekFilter) {
      setWeekFilter(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Row with Archive Toggle and Vendor Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Shipments</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="w-full sm:w-64">
            <VendorSearch
              onSelect={(vendor) => setSelectedVendorCode(vendor?.vendor_code || null)}
              selectedVendorCode={selectedVendorCode}
            />
          </div>
          <ArchiveToggleButton 
            showArchived={showArchived}
            toggleArchived={toggleArchived}
          />
        </div>
      </div>

      {/* Week Filter Badge */}
      {weekFilter === 'this-week' && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm">
            <Calendar className="h-4 w-4" />
            <span>This Week's Shipments</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearWeekFilter}
              className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <ShipmentFilters 
          transportMode={transportModeFilter}
          status={statusFilter}
          selectedVendorCode={selectedVendorCode}
          etdFrom={etdFrom}
          etdTo={etdTo}
          etaFrom={etaFrom}
          etaTo={etaTo}
          onTransportModeChange={setTransportModeFilter}
          onStatusChange={setStatusFilter}
          onVendorChange={(vendor) => setSelectedVendorCode(vendor?.vendor_code || null)}
          onEtdFromChange={setEtdFrom}
          onEtdToChange={setEtdTo}
          onEtaFromChange={setEtaFrom}
          onEtaToChange={setEtaTo}
          onClearAll={clearAllFilters}
          hideVendorFilter={true}
        />
      </div>
    </div>
  );
};

export default TableFiltersBar;
