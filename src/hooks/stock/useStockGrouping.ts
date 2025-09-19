import { useMemo } from 'react';
import { StockItem } from './useStockDataFetching';

export interface VendorGroup {
  vendor_code: string | null;
  vendor_name: string | null;
  items: StockItem[];
  total_value: number;
  total_items: number;
  critical_items: number;
}

export interface GroupedStockItems {
  [key: string]: {
    category_description: string | null;
    vendors: VendorGroup[];
    total_value: number;
    total_items: number;
    critical_items: number;
  };
}

export const useStockGrouping = (
  filteredItems: StockItem[],
  debouncedSearchTerm: string
) => {
  // Group items by posting_group and then by vendor - memoize for performance
  const groupedItems = useMemo(() => {
    const grouped: GroupedStockItems = {};
    
    if (filteredItems.length === 0) return grouped;
    
    // If searching, flatten the results (don't group by vendor)
    if (debouncedSearchTerm) {
      // Group by category only when searching
      filteredItems.forEach((item) => {
        const groupKey = item.posting_group || 'Uncategorized';
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            category_description: item.category_description || groupKey,
            vendors: [],
            total_value: 0,
            total_items: 0,
            critical_items: 0
          };
        }
        
        // Create a single vendor group for flattened results
        let flatVendorGroup = grouped[groupKey].vendors.find(v => v.vendor_code === 'SEARCH_RESULTS');
        if (!flatVendorGroup) {
          flatVendorGroup = {
            vendor_code: 'SEARCH_RESULTS',
            vendor_name: 'Search Results',
            items: [],
            total_value: 0,
            total_items: 0,
            critical_items: 0
          };
          grouped[groupKey].vendors.push(flatVendorGroup);
        }
        
        flatVendorGroup.items.push(item);
        flatVendorGroup.total_value += item.stock_value;
        flatVendorGroup.total_items += 1;
        
        if (item.stock_status === 'critical') {
          flatVendorGroup.critical_items += 1;
        }
        
        // Update category totals
        grouped[groupKey].total_value += item.stock_value;
        grouped[groupKey].total_items += 1;
        
        if (item.stock_status === 'critical') {
          grouped[groupKey].critical_items += 1;
        }
      });
    } else {
      // Normal grouping by category and vendor
      filteredItems.forEach((item) => {
        const groupKey = item.posting_group || 'Uncategorized';
        const vendorKey = item.vendor_code || 'UNKNOWN';
        const vendorName = item.vendor_name || 'Unknown Vendor';
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = {
            category_description: item.category_description || groupKey,
            vendors: [],
            total_value: 0,
            total_items: 0,
            critical_items: 0
          };
        }
        
        let vendorGroup = grouped[groupKey].vendors.find(v => v.vendor_code === vendorKey);
        if (!vendorGroup) {
          vendorGroup = {
            vendor_code: vendorKey,
            vendor_name: vendorName,
            items: [],
            total_value: 0,
            total_items: 0,
            critical_items: 0
          };
          grouped[groupKey].vendors.push(vendorGroup);
        }
        
        vendorGroup.items.push(item);
        vendorGroup.total_value += item.stock_value;
        vendorGroup.total_items += 1;
        
        if (item.stock_status === 'critical') {
          vendorGroup.critical_items += 1;
        }
        
        // Update category totals
        grouped[groupKey].total_value += item.stock_value;
        grouped[groupKey].total_items += 1;
        
        if (item.stock_status === 'critical') {
          grouped[groupKey].critical_items += 1;
        }
      });
      
      // Sort vendors alphabetically within each category
      Object.values(grouped).forEach(category => {
        category.vendors.sort((a, b) => {
          if (a.vendor_name === 'Unknown Vendor' && b.vendor_name !== 'Unknown Vendor') return 1;
          if (b.vendor_name === 'Unknown Vendor' && a.vendor_name !== 'Unknown Vendor') return -1;
          return (a.vendor_name || '').localeCompare(b.vendor_name || '');
        });
      });
    }
    
    return grouped;
  }, [filteredItems, debouncedSearchTerm]);

  return {
    groupedItems,
  };
};