import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ItemsV2Filters } from '@/types/itemsV2';

interface PerformanceFiltersSectionProps {
  localFilters: ItemsV2Filters;
  toggleArrayFilter: (key: keyof ItemsV2Filters, value: string) => void;
}

export const PerformanceFiltersSection: React.FC<PerformanceFiltersSectionProps> = ({
  localFilters,
  toggleArrayFilter
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Performance Rating */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Performance Rating</Label>
        <div className="space-y-1">
          {['excellent', 'good', 'average', 'poor'].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={localFilters.performance_rating?.includes(rating as any) || false}
                onCheckedChange={() => toggleArrayFilter('performance_rating', rating)}
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm capitalize">
                {rating}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sales Trend */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Sales Trend</Label>
        <div className="space-y-1">
          {['up', 'stable', 'down'].map((trend) => (
            <div key={trend} className="flex items-center space-x-2">
              <Checkbox
                id={`trend-${trend}`}
                checked={localFilters.sales_trend?.includes(trend as any) || false}
                onCheckedChange={() => toggleArrayFilter('sales_trend', trend)}
              />
              <Label htmlFor={`trend-${trend}`} className="text-sm capitalize">
                {trend}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Stock Status</Label>
        <div className="space-y-1">
          {['critical', 'low', 'adequate', 'high'].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`stock-${status}`}
                checked={localFilters.stock_status?.includes(status as any) || false}
                onCheckedChange={() => toggleArrayFilter('stock_status', status)}
              />
              <Label htmlFor={`stock-${status}`} className="text-sm capitalize">
                {status}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};