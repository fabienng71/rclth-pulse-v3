
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useVendorAchievement = (
  vendorCode: string | undefined, 
  startDate: Date | string | undefined, 
  endDate: Date | string | undefined,
  targetType: string | undefined
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['vendorAchievement', vendorCode, startDate, endDate, targetType],
    queryFn: async () => {
      if (!vendorCode || !startDate || !targetType) return { totalValue: 0 };
      
      // Helper function to convert date to ISO string
      const toISOString = (date: Date | string): string => {
        if (typeof date === 'string') {
          // If it's already a string in YYYY-MM-DD format, add time for ISO string
          if (date.includes('T')) {
            return date;
          } else {
            return new Date(date + 'T00:00:00').toISOString();
          }
        } else {
          return date.toISOString();
        }
      };
      
      // Convert dates to ISO strings for the query
      const startDateStr = toISOString(startDate);
      // If end date is not provided, use current date
      const endDateStr = endDate ? toISOString(endDate) : new Date().toISOString();
      
      console.log(`Fetching vendor achievement for ${vendorCode} from ${startDateStr} to ${endDateStr} with target type ${targetType}`);
      
      // Query to get total value (either quantity or amount) for the vendor within the date range
      const { data: salesData, error: salesError } = await supabase
        .from('salesdata')
        .select(targetType === 'Amount' ? 'amount' : 'quantity')
        .eq('item_vendor_code', vendorCode)
        .gte('posting_date', startDateStr)
        .lte('posting_date', endDateStr)
        .not('amount', 'is', null);
      
      if (salesError) {
        console.error('Error fetching vendor achievement data:', salesError);
        throw new Error('Failed to fetch vendor achievement data');
      }
      
      // Calculate total based on target type
      let totalValue = 0;
      
      if (targetType === 'Amount') {
        // Sum the amount values when target type is Amount
        totalValue = salesData.reduce((sum, item) => {
          return sum + (Number((item as { amount: number }).amount) || 0);
        }, 0);
      } else {
        // Sum the quantity values when target type is PC or KG
        totalValue = salesData.reduce((sum, item) => {
          return sum + (Number((item as { quantity: number }).quantity) || 0);
        }, 0);
      }
      
      return { totalValue };
    },
    enabled: !!vendorCode && !!startDate && !!targetType,
  });
  
  return {
    totalValue: data?.totalValue || 0,
    isLoading,
    error
  };
};
