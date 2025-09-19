import React from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ItemsV2Filters } from '@/types/itemsV2';
import { cn } from '@/lib/utils';
import {
  QuickActionSection,
  CategoryFiltersSection,
  PerformanceFiltersSection,
  RangeFiltersSection,
  DateFiltersSection,
  FilterActions,
  useAdvancedFilters
} from './advanced-filters';

interface AdvancedFiltersProps {
  filters: ItemsV2Filters;
  onFiltersChange: (filters: ItemsV2Filters) => void;
  onClose?: () => void;
  availableOptions?: {
    categories?: string[];
    brands?: string[];
    vendors?: string[];
  };
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onClose,
  availableOptions = {},
  className,
}) => {
  const {
    localFilters,
    setLocalFilters,
    priceRange,
    setPriceRange,
    marginRange,
    setMarginRange,
    updateFilter,
    toggleArrayFilter,
    applyFilters,
    resetFilters,
    hasActiveFilters,
    getActiveFiltersCount,
  } = useAdvancedFilters(filters, onFiltersChange, onClose);

  return (
    <Card className={cn("w-full max-w-4xl", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </CardTitle>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <QuickActionSection 
          localFilters={localFilters}
          updateFilter={updateFilter}
        />

        <Separator />

        <CategoryFiltersSection
          localFilters={localFilters}
          toggleArrayFilter={toggleArrayFilter}
          availableOptions={availableOptions}
        />

        <Separator />

        <PerformanceFiltersSection
          localFilters={localFilters}
          toggleArrayFilter={toggleArrayFilter}
        />

        <Separator />

        <RangeFiltersSection
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          marginRange={marginRange}
          setMarginRange={setMarginRange}
        />

        <Separator />

        <DateFiltersSection
          localFilters={localFilters}
          updateFilter={updateFilter}
        />
      </CardContent>

      <FilterActions
        getActiveFiltersCount={getActiveFiltersCount}
        setLocalFilters={setLocalFilters}
        filters={filters}
        applyFilters={applyFilters}
      />
    </Card>
  );
};

export default AdvancedFilters;