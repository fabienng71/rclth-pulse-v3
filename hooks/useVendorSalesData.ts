
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, eachMonthOfInterval } from 'date-fns';

interface VendorMonthlySale {
  vendor_code: string;
  vendor_name: string;
  month: string;
  sales_amount: number;
}

export interface VendorSalesData {
  vendor_code: string;
  vendor_name: string;
  months: Record<string, number>; // Format: 'YYYY-MM': sales amount
  total: number;
}

export const useVendorSalesData = (fromDate: Date, toDate: Date) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendorSales', fromDate.toISOString(), toDate.toISOString()],
    queryFn: async () => {
      // Call the database function instead of manually processing the data
      const { data: vendorSales, error: vendorSalesError } = await supabase
        .rpc('get_vendor_monthly_sales', {
          from_date: startOfMonth(fromDate).toISOString(),
          to_date: endOfMonth(toDate).toISOString()
        });
        
      if (vendorSalesError) {
        console.error('Error fetching vendor sales:', vendorSalesError);
        throw new Error('Failed to fetch vendor sales data');
      }
      
      // Generate all months in the interval for consistent display
      const monthsInRange = eachMonthOfInterval({
        start: startOfMonth(fromDate),
        end: endOfMonth(toDate)
      }).map(date => format(date, 'yyyy-MM'));
      
      // Get all vendors to ensure we include those with no sales
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('vendor_code, vendor_name')
        .order('vendor_name');
        
      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError);
        throw new Error('Failed to fetch vendors');
      }
      
      // Process the vendor sales data into the format we need
      const vendorSalesMap = new Map<string, VendorSalesData>();
      
      // Initialize vendor data with empty months
      vendors.forEach(vendor => {
        const monthsObj: Record<string, number> = {};
        monthsInRange.forEach(month => {
          monthsObj[month] = 0;
        });
        
        vendorSalesMap.set(vendor.vendor_code, {
          vendor_code: vendor.vendor_code,
          vendor_name: vendor.vendor_name,
          months: monthsObj,
          total: 0
        });
      });
      
      // Fill in the sales data
      vendorSales.forEach((sale: VendorMonthlySale) => {
        const vendorData = vendorSalesMap.get(sale.vendor_code);
        
        if (vendorData && monthsInRange.includes(sale.month)) {
          vendorData.months[sale.month] = Number(sale.sales_amount) || 0;
          vendorData.total += Number(sale.sales_amount) || 0;
        }
      });
      
      return Array.from(vendorSalesMap.values());
    }
  });
  
  return {
    vendorSalesData: data || [],
    months: data && data.length > 0 ? Object.keys(data[0].months).sort() : [],
    isLoading,
    error
  };
};
