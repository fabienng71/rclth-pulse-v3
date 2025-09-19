
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Package, Ship, Plane, Clock, CheckCircle, AlertTriangle, PackagePlus, X } from 'lucide-react';
import VendorSearch from '../search/VendorSearch';
import DateRangePicker from './DateRangePicker';

type ShipmentFiltersProps = {
  transportMode: string | null;
  status: string | null;
  selectedVendorCode: string | null;
  etdFrom: Date | null;
  etdTo: Date | null;
  etaFrom: Date | null;
  etaTo: Date | null;
  onTransportModeChange: (value: string | null) => void;
  onStatusChange: (value: string | null) => void;
  onVendorChange: (vendor: { vendor_code: string, vendor_name: string } | null) => void;
  onEtdFromChange: (date: Date | null) => void;
  onEtdToChange: (date: Date | null) => void;
  onEtaFromChange: (date: Date | null) => void;
  onEtaToChange: (date: Date | null) => void;
  onClearAll: () => void;
  hideVendorFilter?: boolean;
};

const ShipmentFilters: React.FC<ShipmentFiltersProps> = ({
  transportMode,
  status,
  selectedVendorCode,
  etdFrom,
  etdTo,
  etaFrom,
  etaTo,
  onTransportModeChange,
  onStatusChange,
  onVendorChange,
  onEtdFromChange,
  onEtdToChange,
  onEtaFromChange,
  onEtaToChange,
  onClearAll,
  hideVendorFilter = false,
}) => {
  const hasActiveFilters = transportMode || status || selectedVendorCode || etdFrom || etdTo || etaFrom || etaTo;

  return (
    <div className="space-y-6">
      {/* Basic Filters Row */}
      <div className={`grid grid-cols-1 ${hideVendorFilter ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
        {/* Transport Mode */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Transport Mode</label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={transportMode || ''}
            onValueChange={(value) => onTransportModeChange(value || null)}
            className="justify-start"
          >
            <ToggleGroupItem value="all" aria-label="All transport modes" className="bg-gray-50 data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800">
              <Package className="h-4 w-4 mr-2" />
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="sea" aria-label="Sea transport" className="bg-blue-50 data-[state=on]:bg-blue-200 data-[state=on]:text-blue-800">
              <Ship className="h-4 w-4 mr-2" />
              Sea
            </ToggleGroupItem>
            <ToggleGroupItem value="air" aria-label="Air transport" className="bg-purple-50 data-[state=on]:bg-purple-200 data-[state=on]:text-purple-800">
              <Plane className="h-4 w-4 mr-2" />
              Air
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={status || ''}
            onValueChange={(value) => onStatusChange(value || null)}
            className="justify-start flex-wrap"
          >
            <ToggleGroupItem value="all" aria-label="All statuses" className="bg-gray-50 data-[state=on]:bg-gray-200 data-[state=on]:text-gray-800">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="pending" aria-label="Pending" className="bg-purple-50 data-[state=on]:bg-purple-200 data-[state=on]:text-purple-800">
              <PackagePlus className="h-4 w-4 mr-1" />
              Pending
            </ToggleGroupItem>
            <ToggleGroupItem value="in_transit" aria-label="In Transit" className="bg-blue-50 data-[state=on]:bg-blue-200 data-[state=on]:text-blue-800">
              <Clock className="h-4 w-4 mr-1" />
              In Transit
            </ToggleGroupItem>
            <ToggleGroupItem value="delivered" aria-label="Delivered" className="bg-green-50 data-[state=on]:bg-green-200 data-[state=on]:text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Delivered
            </ToggleGroupItem>
            <ToggleGroupItem value="delayed" aria-label="Delayed" className="bg-amber-50 data-[state=on]:bg-amber-200 data-[state=on]:text-amber-800">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Delayed
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Vendor - Only show if not hidden */}
        {!hideVendorFilter && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Vendor</label>
            <VendorSearch
              onSelect={(vendor) => onVendorChange(vendor)}
              selectedVendorCode={selectedVendorCode}
            />
          </div>
        )}
      </div>

      {/* Date Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateRangePicker
          from={etdFrom}
          to={etdTo}
          onFromChange={onEtdFromChange}
          onToChange={onEtdToChange}
          label="ETD (Estimated Time of Departure)"
          placeholder="Select ETD range"
        />

        <DateRangePicker
          from={etaFrom}
          to={etaTo}
          onFromChange={onEtaFromChange}
          onToChange={onEtaToChange}
          label="ETA (Estimated Time of Arrival)"
          placeholder="Select ETA range"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-2 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShipmentFilters;
