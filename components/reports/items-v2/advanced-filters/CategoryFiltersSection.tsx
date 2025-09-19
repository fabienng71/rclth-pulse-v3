import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Package } from 'lucide-react';
import { ItemsV2Filters } from '@/types/itemsV2';

interface CategoryFiltersSectionProps {
  localFilters: ItemsV2Filters;
  toggleArrayFilter: (key: keyof ItemsV2Filters, value: string) => void;
  availableOptions: {
    categories?: string[];
    brands?: string[];
    vendors?: string[];
  };
}

export const CategoryFiltersSection: React.FC<CategoryFiltersSectionProps> = ({
  localFilters,
  toggleArrayFilter,
  availableOptions
}) => {
  return (
    <div className="space-y-6">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Package className="h-4 w-4" />
        Product Attributes
      </Label>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Categories</Label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {(availableOptions.categories || []).map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={localFilters.categories?.includes(category) || false}
                  onCheckedChange={() => toggleArrayFilter('categories', category)}
                />
                <Label htmlFor={`category-${category}`} className="text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Brands</Label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {(availableOptions.brands || []).map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={localFilters.brands?.includes(brand) || false}
                  onCheckedChange={() => toggleArrayFilter('brands', brand)}
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Vendors */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Vendors</Label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {(availableOptions.vendors || []).map((vendor) => (
              <div key={vendor} className="flex items-center space-x-2">
                <Checkbox
                  id={`vendor-${vendor}`}
                  checked={localFilters.vendors?.includes(vendor) || false}
                  onCheckedChange={() => toggleArrayFilter('vendors', vendor)}
                />
                <Label htmlFor={`vendor-${vendor}`} className="text-sm">
                  {vendor}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};