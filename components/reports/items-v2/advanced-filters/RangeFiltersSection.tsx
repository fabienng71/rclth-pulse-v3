import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DollarSign, Percent } from 'lucide-react';

interface RangeFiltersSectionProps {
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  marginRange: [number, number];
  setMarginRange: React.Dispatch<React.SetStateAction<[number, number]>>;
}

export const RangeFiltersSection: React.FC<RangeFiltersSectionProps> = ({
  priceRange,
  setPriceRange,
  marginRange,
  setMarginRange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Price Range
        </Label>
        <div className="px-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={10000}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Margin Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Margin Range
        </Label>
        <div className="px-3">
          <Slider
            value={marginRange}
            onValueChange={setMarginRange}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{marginRange[0]}%</span>
            <span>{marginRange[1]}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};