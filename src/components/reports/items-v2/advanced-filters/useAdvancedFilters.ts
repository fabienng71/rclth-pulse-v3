import { useState, useEffect } from 'react';
import { ItemsV2Filters } from '@/types/itemsV2';

export const useAdvancedFilters = (
  filters: ItemsV2Filters,
  onFiltersChange: (filters: ItemsV2Filters) => void,
  onClose?: () => void
) => {
  const [localFilters, setLocalFilters] = useState<ItemsV2Filters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.price_range || [0, 10000]
  );
  const [marginRange, setMarginRange] = useState<[number, number]>(
    filters.margin_range || [0, 100]
  );

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange(filters.price_range || [0, 10000]);
    setMarginRange(filters.margin_range || [0, 100]);
  }, [filters]);

  const updateFilter = (key: keyof ItemsV2Filters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const toggleArrayFilter = (key: keyof ItemsV2Filters, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const applyFilters = () => {
    const finalFilters = {
      ...localFilters,
      price_range: priceRange[0] > 0 || priceRange[1] < 10000 ? priceRange : undefined,
      margin_range: marginRange[0] > 0 || marginRange[1] < 100 ? marginRange : undefined,
    };
    onFiltersChange(finalFilters);
    onClose?.();
  };

  const resetFilters = () => {
    const resetFilters: ItemsV2Filters = {
      search_term: localFilters.search_term, // Keep search term
    };
    setLocalFilters(resetFilters);
    setPriceRange([0, 10000]);
    setMarginRange([0, 100]);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = () => {
    return Object.keys(localFilters).some(key => {
      if (key === 'search_term') return false;
      const value = localFilters[key as keyof ItemsV2Filters];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    }) || priceRange[0] > 0 || priceRange[1] < 10000 || marginRange[0] > 0 || marginRange[1] < 100;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.categories?.length) count++;
    if (localFilters.brands?.length) count++;
    if (localFilters.vendors?.length) count++;
    if (localFilters.performance_rating?.length) count++;
    if (localFilters.sales_trend?.length) count++;
    if (localFilters.stock_status?.length) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (marginRange[0] > 0 || marginRange[1] < 100) count++;
    if (localFilters.my_top_performers) count++;
    if (localFilters.quick_wins) count++;
    if (localFilters.customer_favorites) count++;
    if (localFilters.seasonal_opportunities) count++;
    if (localFilters.has_reorder_alert) count++;
    if (localFilters.last_sale_after) count++;
    return count;
  };

  return {
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
  };
};