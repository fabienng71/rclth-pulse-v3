import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Tag, Building } from 'lucide-react';
import { useItemsFilterOptions } from '@/hooks/useItemsFilterOptions';
import { useItemsFilterHandlers, ItemsFilters } from '@/hooks/useItemsFilterHandlers';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { FilterSection } from './filters/FilterSection';
import { ActiveFiltersSummary } from './filters/ActiveFiltersSummary';
import { FiltersHeader } from './filters/FiltersHeader';
import { SpecialFilters } from './filters/SpecialFilters';

// Re-export for backward compatibility
export type { ItemsFilters };

interface ItemsFiltersProps {
  filters: ItemsFilters;
  onFiltersChange: (filters: ItemsFilters) => void;
  isLoading?: boolean;
}

export const ItemsFiltersComponent: React.FC<ItemsFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading = false
}) => {
  const { filterOptions, isLoading: isLoadingOptions } = useItemsFilterOptions();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    handleCategoryChange,
    handleBrandChange,
    handleVendorChange,
    handleShowOnlyUnassignedChange,
    handleClearAllFilters,
    handleClearCategories,
    handleClearBrands,
    handleClearVendors,
    activeFilterCount,
  } = useItemsFilterHandlers({ filters, onFiltersChange });

  if (isLoadingOptions) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            Loading filter options...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform filter options for FilterSection components
  const categoryOptions = filterOptions.categories.map(category => ({
    id: category.posting_group,
    label: category.description || category.posting_group,
    count: category.item_count
  }));

  const brandOptions = filterOptions.brands.map(brand => ({
    id: brand.brand,
    label: brand.brand,
    count: brand.item_count
  }));

  const vendorOptions = filterOptions.vendors.map(vendor => ({
    id: vendor.vendor_code,
    label: vendor.vendor_name || vendor.vendor_code,
    count: vendor.item_count
  }));

  return (
    <Card className="mb-4">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <FiltersHeader
          activeFilterCount={activeFilterCount}
          isExpanded={isExpanded}
          onClearAllFilters={handleClearAllFilters}
        />

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterSection
                title="Categories"
                icon={Package}
                options={categoryOptions}
                selectedValues={filters.categories}
                onValueChange={handleCategoryChange}
                onClear={handleClearCategories}
              />

              <FilterSection
                title="Brands"
                icon={Tag}
                options={brandOptions}
                selectedValues={filters.brands}
                onValueChange={handleBrandChange}
                onClear={handleClearBrands}
              />

              <FilterSection
                title="Vendors"
                icon={Building}
                options={vendorOptions}
                selectedValues={filters.vendors}
                onValueChange={handleVendorChange}
                onClear={handleClearVendors}
              />

              <SpecialFilters
                showOnlyUnassigned={filters.showOnlyUnassigned}
                onShowOnlyUnassignedChange={handleShowOnlyUnassignedChange}
              />
            </div>

            <ActiveFiltersSummary
              filters={filters}
              filterOptions={filterOptions}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onVendorChange={handleVendorChange}
              onShowOnlyUnassignedChange={handleShowOnlyUnassignedChange}
              activeFilterCount={activeFilterCount}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};