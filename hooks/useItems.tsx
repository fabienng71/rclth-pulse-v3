
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface Item {
  item_code: string;
  description: string | null;
  base_unit_code: string | null;
  unit_price: number | null;
  vendor_code: string | null;
}

interface Vendor {
  vendor_code: string;
  vendor_name: string;
}

interface SalesDataItem {
  item_code: string;
}

export const useItems = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const { profile, isAdmin } = useAuthStore();
  
  // Fetch items data with user filtering
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items', profile?.spp_code, isAdmin],
    queryFn: async () => {
      let query = supabase
        .from('items' as any)
        .select('item_code, description, base_unit_code, unit_price, vendor_code');
      
      // If user is not an admin and has an SPP code, filter the data
      if (!isAdmin && profile?.spp_code) {
        // Get item codes from salesdata where salesperson_code matches user's SPP code
        const { data: userItemCodes, error: itemCodesError } = await supabase
          .from('salesdata' as any)
          .select('item_code')
          .eq('salesperson_code', profile.spp_code);
          
        if (itemCodesError) {
          throw new Error(itemCodesError.message);
        }
        
        // Filter out duplicates manually since we can't use .distinct()
        const salesData = userItemCodes as unknown as SalesDataItem[] || [];
        const uniqueItemCodes = Array.from(
          new Set(salesData.map(item => item.item_code))
        ).filter(code => code !== null) as string[];
        
        // If user has no items, return empty array
        if (!uniqueItemCodes || uniqueItemCodes.length === 0) {
          return [];
        }
        
        // Filter items to only include those the user has sold
        query = query.in('item_code', uniqueItemCodes);
      }
      
      const response = await query;
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return (response.data || []) as unknown as Item[];
    }
  });

  // Fetch vendors data
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await supabase
        .from('vendors' as any)
        .select('vendor_code, vendor_name')
        .order('vendor_name', { ascending: true });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      return (response.data || []) as unknown as Vendor[];
    }
  });

  // Filter items based on search term and vendor filter
  const filteredItems = items?.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (item.item_code && item.item_code.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      (item.base_unit_code && item.base_unit_code.toLowerCase().includes(searchLower))
    );
    
    // Apply vendor filter if not set to 'all'
    const matchesVendor = vendorFilter === 'all' || item.vendor_code === vendorFilter;
    
    return matchesSearch && matchesVendor;
  });

  // Find vendor name by code
  const getVendorName = (vendorCode: string | null) => {
    if (!vendorCode) return '-';
    const vendor = vendors?.find(v => v.vendor_code === vendorCode);
    return vendor?.vendor_name || vendorCode;
  };

  // Handle individual item selection
  const toggleItemSelection = (itemCode: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemCode)) {
        return prev.filter(code => code !== itemCode);
      } else {
        return [...prev, itemCode];
      }
    });
  };

  // Handle select/deselect all items
  const toggleSelectAll = () => {
    if (filteredItems && filteredItems.length > 0) {
      if (selectedItems.length === filteredItems.length) {
        // Deselect all if all are currently selected
        setSelectedItems([]);
      } else {
        // Select all if not all are currently selected
        const allItemCodes = filteredItems.map(item => item.item_code);
        setSelectedItems(allItemCodes);
      }
    }
  };

  // Check if all visible items are selected
  const areAllSelected = filteredItems && filteredItems.length > 0 && 
    selectedItems.length === filteredItems.length;

  return {
    searchTerm,
    setSearchTerm,
    vendorFilter,
    setVendorFilter,
    selectedItems,
    filteredItems,
    isLoading,
    error,
    vendors,
    toggleItemSelection,
    toggleSelectAll,
    areAllSelected,
    getVendorName
  };
};
