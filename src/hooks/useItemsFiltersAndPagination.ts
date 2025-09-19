import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ItemsFilters } from '@/hooks/useItemsData';

export const useItemsFiltersAndPagination = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<ItemsFilters>(() => {
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
    const vendors = searchParams.get('vendors')?.split(',').filter(Boolean) || [];
    const showOnlyUnassigned = searchParams.get('unassigned') === 'true';
    
    return {
      categories,
      brands,
      vendors,
      showOnlyUnassigned
    };
  });

  const handleFiltersChange = (newFilters: ItemsFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const handleClearSelection = () => setSelectedItems([]);

  // Sync filters with URL parameters
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (filters.categories.length > 0) {
      newSearchParams.set('categories', filters.categories.join(','));
    }
    
    if (filters.brands.length > 0) {
      newSearchParams.set('brands', filters.brands.join(','));
    }
    
    if (filters.vendors.length > 0) {
      newSearchParams.set('vendors', filters.vendors.join(','));
    }
    
    if (filters.showOnlyUnassigned) {
      newSearchParams.set('unassigned', 'true');
    }
    
    setSearchParams(newSearchParams, { replace: true });
  }, [filters, setSearchParams]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    filters,
    selectedItems,
    setSelectedItems,
    handleFiltersChange,
    handleClearSelection,
  };
};