import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, EyeOff, RotateCcw, DollarSign } from 'lucide-react';
import { StockFilters } from '@/hooks/useStockData';

interface StockFilterTogglesProps {
  filters: StockFilters;
  onFiltersChange: (filters: StockFilters) => void;
  className?: string;
}

export function StockFilterToggles({ 
  filters, 
  onFiltersChange, 
  className 
}: StockFilterTogglesProps) {
  const handleToggle = (filterKey: keyof StockFilters) => {
    onFiltersChange({
      ...filters,
      [filterKey]: !filters[filterKey]
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      hideZeroStock: false,
      showOnlyCriticalAndLow: false,
      showOnlyPricelist: false
    });
  };

  const hasActiveFilters = filters.hideZeroStock || filters.showOnlyCriticalAndLow || filters.showOnlyPricelist;

  return (
    <Card className={`${className || ''} border-muted`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            Filters:
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Hide Zero Stock Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="hide-zero-stock"
                checked={filters.hideZeroStock}
                onCheckedChange={() => handleToggle('hideZeroStock')}
              />
              <Label 
                htmlFor="hide-zero-stock" 
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <EyeOff className="h-4 w-4" />
                Hide Zero Stock
              </Label>
            </div>

            {/* Show Only Critical & Low Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="show-critical-low"
                checked={filters.showOnlyCriticalAndLow}
                onCheckedChange={() => handleToggle('showOnlyCriticalAndLow')}
              />
              <Label 
                htmlFor="show-critical-low" 
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Critical & Low Stock Only
              </Label>
            </div>

            {/* Show Only Pricelist Items Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="show-pricelist-only"
                checked={filters.showOnlyPricelist}
                onCheckedChange={() => handleToggle('showOnlyPricelist')}
              />
              <Label 
                htmlFor="show-pricelist-only" 
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <DollarSign className="h-4 w-4 text-green-500" />
                Pricelist Items Only
              </Label>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-muted">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {filters.hideZeroStock && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-full">
                  <EyeOff className="h-3 w-3" />
                  Zero stock hidden
                </span>
              )}
              {filters.showOnlyCriticalAndLow && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  Critical & low only
                </span>
              )}
              {filters.showOnlyPricelist && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  <DollarSign className="h-3 w-3" />
                  Pricelist items only
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}