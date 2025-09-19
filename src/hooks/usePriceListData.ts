
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PriceListItem } from './priceList/types';
import { fetchPriceListItems, fetchCategories, fetchVendors } from './priceList/fetchPriceListData';
import { organizeItemsByCategory, sortCategoriesByDescription } from './priceList/organizeItems';

export type { PriceListItem } from './priceList/types';

export const usePriceListData = () => {
  const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery({
    queryKey: ['priceListItems'],
    queryFn: fetchPriceListItems
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors
  });

  // Organize items by category
  const organizedItems = useMemo(() => 
    organizeItemsByCategory(items, categories, vendors), 
    [items, categories, vendors]
  );

  // Get array of category keys in alphabetical order by their descriptions
  const categoryOrder = useMemo(() => 
    sortCategoriesByDescription(organizedItems, categories), 
    [organizedItems, categories]
  );

  const isLoading = itemsLoading || categoriesLoading || vendorsLoading;
  const error = itemsError;

  return { 
    organizedItems, 
    categoryOrder,
    isLoading, 
    error,
    categories
  };
};
