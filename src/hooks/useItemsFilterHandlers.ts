import { useCallback } from 'react';

export interface ItemsFilters {
  categories: string[];
  brands: string[];
  vendors: string[];
  showOnlyUnassigned: boolean;
}

interface UseItemsFilterHandlersProps {
  filters: ItemsFilters;
  onFiltersChange: (filters: ItemsFilters) => void;
}

export const useItemsFilterHandlers = ({ filters, onFiltersChange }: UseItemsFilterHandlersProps) => {
  // Handle category filter changes
  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  }, [filters, onFiltersChange]);

  // Handle brand filter changes
  const handleBrandChange = useCallback((brand: string, checked: boolean) => {
    const newBrands = checked 
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    
    onFiltersChange({
      ...filters,
      brands: newBrands
    });
  }, [filters, onFiltersChange]);

  // Handle vendor filter changes
  const handleVendorChange = useCallback((vendorCode: string, checked: boolean) => {
    const newVendors = checked 
      ? [...filters.vendors, vendorCode]
      : filters.vendors.filter(v => v !== vendorCode);
    
    onFiltersChange({
      ...filters,
      vendors: newVendors
    });
  }, [filters, onFiltersChange]);

  // Handle show only unassigned toggle
  const handleShowOnlyUnassignedChange = useCallback((checked: boolean) => {
    onFiltersChange({
      ...filters,
      showOnlyUnassigned: checked
    });
  }, [filters, onFiltersChange]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    onFiltersChange({
      categories: [],
      brands: [],
      vendors: [],
      showOnlyUnassigned: false
    });
  }, [onFiltersChange]);

  // Clear specific filter types
  const handleClearCategories = useCallback(() => {
    onFiltersChange({ ...filters, categories: [] });
  }, [filters, onFiltersChange]);

  const handleClearBrands = useCallback(() => {
    onFiltersChange({ ...filters, brands: [] });
  }, [filters, onFiltersChange]);

  const handleClearVendors = useCallback(() => {
    onFiltersChange({ ...filters, vendors: [] });
  }, [filters, onFiltersChange]);

  // Calculate active filter count
  const activeFilterCount = filters.categories.length + filters.brands.length + 
    filters.vendors.length + (filters.showOnlyUnassigned ? 1 : 0);

  return {
    handleCategoryChange,
    handleBrandChange,
    handleVendorChange,
    handleShowOnlyUnassignedChange,
    handleClearAllFilters,
    handleClearCategories,
    handleClearBrands,
    handleClearVendors,
    activeFilterCount,
  };
};