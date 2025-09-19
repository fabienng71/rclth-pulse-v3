
import { VendorSalesData } from "@/hooks/useVendorSalesData";

interface SortConfig {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  months: string[];
}

export const sortVendorData = (data: VendorSalesData[], config: SortConfig): VendorSalesData[] => {
  const { sortField, sortDirection, months } = config;

  return [...data].sort((a, b) => {
    // Handle sorting by months (dynamic fields)
    if (months.includes(sortField)) {
      const aValue = a.months[sortField] || 0;
      const bValue = b.months[sortField] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    // Handle sorting by static fields
    else if (sortField === 'total') {
      return sortDirection === 'asc' ? a.total - b.total : b.total - a.total;
    } else {
      const aValue = String(a[sortField as 'vendor_code' | 'vendor_name']).toLowerCase();
      const bValue = String(b[sortField as 'vendor_code' | 'vendor_name']).toLowerCase();
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });
};
