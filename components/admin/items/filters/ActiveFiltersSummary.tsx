import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryOption, BrandOption, VendorOption } from '@/hooks/useItemsFilterOptions';
import { ItemsFilters } from '@/hooks/useItemsFilterHandlers';

interface ActiveFiltersSummaryProps {
  filters: ItemsFilters;
  filterOptions: {
    categories: CategoryOption[];
    brands: BrandOption[];
    vendors: VendorOption[];
  };
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  onBrandChange: (brand: string, checked: boolean) => void;
  onVendorChange: (vendorCode: string, checked: boolean) => void;
  onShowOnlyUnassignedChange: (checked: boolean) => void;
  activeFilterCount: number;
}

export const ActiveFiltersSummary: React.FC<ActiveFiltersSummaryProps> = ({
  filters,
  filterOptions,
  onCategoryChange,
  onBrandChange,
  onVendorChange,
  onShowOnlyUnassignedChange,
  activeFilterCount
}) => {
  if (activeFilterCount === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">Active filters:</span>
        
        {filters.categories.map(categoryId => {
          const category = filterOptions.categories.find(c => c.posting_group === categoryId);
          return (
            <Badge key={`cat-${categoryId}`} variant="secondary" className="text-xs">
              {category?.description || categoryId}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onCategoryChange(categoryId, false)}
              >
                ×
              </Button>
            </Badge>
          );
        })}
        
        {filters.brands.map(brand => (
          <Badge key={`brand-${brand}`} variant="secondary" className="text-xs">
            {brand}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={() => onBrandChange(brand, false)}
            >
              ×
            </Button>
          </Badge>
        ))}
        
        {filters.vendors.map(vendorCode => {
          const vendor = filterOptions.vendors.find(v => v.vendor_code === vendorCode);
          return (
            <Badge key={`vendor-${vendorCode}`} variant="secondary" className="text-xs">
              {vendor?.vendor_name || vendorCode}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={() => onVendorChange(vendorCode, false)}
              >
                ×
              </Button>
            </Badge>
          );
        })}
        
        {filters.showOnlyUnassigned && (
          <Badge variant="secondary" className="text-xs">
            Missing info
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
              onClick={() => onShowOnlyUnassignedChange(false)}
            >
              ×
            </Button>
          </Badge>
        )}
      </div>
    </div>
  );
};