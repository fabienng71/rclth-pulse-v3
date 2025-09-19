
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TimelineFiltersProps {
  transportModeFilter: string;
  statusFilter: string;
  vendorFilter: string;
  vendors: Array<{ code: string; name: string }>;
  onTransportModeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onClearFilters: () => void;
}

const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  transportModeFilter,
  statusFilter,
  vendorFilter,
  vendors,
  onTransportModeChange,
  onStatusChange,
  onVendorChange,
  onClearFilters
}) => {
  const hasActiveFilters = transportModeFilter !== 'all' || statusFilter !== 'all' || vendorFilter !== 'all';

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Transport:</label>
        <Select value={transportModeFilter} onValueChange={onTransportModeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="air">Air</SelectItem>
            <SelectItem value="sea">Sea</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status:</label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="on-schedule">On Schedule</SelectItem>
            <SelectItem value="in-transit">In Transit</SelectItem>
            <SelectItem value="approaching">Approaching</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Vendor:</label>
        <Select value={vendorFilter} onValueChange={onVendorChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {vendors.map((vendor) => (
              <SelectItem key={vendor.code} value={vendor.code}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center gap-1"
        >
          <X className="h-3 w-3" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default TimelineFilters;
