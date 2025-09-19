import React from 'react';
import { Button } from '@/components/ui/button';

interface FilterActionsProps {
  getActiveFiltersCount: () => number;
  setLocalFilters: (filters: any) => void;
  filters: any;
  applyFilters: () => void;
}

export const FilterActions: React.FC<FilterActionsProps> = ({
  getActiveFiltersCount,
  setLocalFilters,
  filters,
  applyFilters
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-t">
      <div className="text-sm text-muted-foreground">
        {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setLocalFilters(filters)}>
          Cancel
        </Button>
        <Button onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};