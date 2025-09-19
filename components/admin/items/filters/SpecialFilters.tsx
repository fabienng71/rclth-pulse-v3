import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SpecialFiltersProps {
  showOnlyUnassigned: boolean;
  onShowOnlyUnassignedChange: (checked: boolean) => void;
}

export const SpecialFilters: React.FC<SpecialFiltersProps> = ({
  showOnlyUnassigned,
  onShowOnlyUnassignedChange
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Special Filters</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-only-unassigned"
            checked={showOnlyUnassigned}
            onCheckedChange={onShowOnlyUnassignedChange}
          />
          <Label htmlFor="show-only-unassigned" className="text-xs cursor-pointer">
            Items missing info
          </Label>
        </div>
      </div>
    </div>
  );
};