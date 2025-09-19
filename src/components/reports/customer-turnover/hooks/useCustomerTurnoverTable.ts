
import { CustomerMonthlyTurnover } from '@/hooks/useCustomerTurnoverData';
import { eachMonthOfInterval, format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { useSortableTable } from '@/hooks/useSortableTable';

export type SortField = 'customer_name' | 'total' | string;

interface DataProcessingResult {
  uniqueCustomers: Array<{ code: string; name: string }>;
  uniqueMonths: string[];
  dataMap: Record<string, Record<string, number>>;
  customerTotals: Record<string, number>;
  monthTotals: Record<string, number>;
  grandTotal: number;
  sortedCustomers: Array<{ code: string; name: string }>;
  hiddenCustomersCount: number; // Added count of hidden customers
}

export const useCustomerTurnoverTable = (
  data: CustomerMonthlyTurnover[],
  fromDate?: Date,
  toDate?: Date,
  includeCredits: boolean = true,
  showZeroTurnover: boolean = false // Added parameter to optionally show zero turnover customers
): DataProcessingResult & {
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: SortField) => void;
} => {
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('customer_name');
  
  console.log("Customer turnover table processing data length:", data.length);
  
  // Get unique customers with proper error handling
  const uniqueCustomerSet = new Set<string>();
  data.forEach(item => {
    if (item.customer_code) {
      uniqueCustomerSet.add(item.customer_code);
    }
  });
  
  const allUniqueCustomers = Array.from(uniqueCustomerSet).map(code => {
    // Find the corresponding data for this customer code
    const customerData = data.find(item => item.customer_code === code);
    if (!customerData) {
      console.warn(`No data found for customer code ${code}`);
    }
    
    return {
      code,
      name: customerData?.search_name || customerData?.customer_name || code
    };
  });
  
  console.log(`Identified ${allUniqueCustomers.length} unique customers`);

  // Get all months in the date range, not just those with data
  const currentFromDate = fromDate || (data.length > 0 ? 
    parse(data.reduce((min, item) => item.year_month < min ? item.year_month : min, data[0].year_month), 'yyyy-MM', new Date()) : 
    new Date());
    
  const currentToDate = toDate || (data.length > 0 ? 
    parse(data.reduce((max, item) => item.year_month > max ? item.year_month : max, data[0].year_month), 'yyyy-MM', new Date()) : 
    new Date());

  // Generate all months in the range
  const uniqueMonths = eachMonthOfInterval({
    start: startOfMonth(currentFromDate),
    end: endOfMonth(currentToDate)
  }).map(date => format(date, 'yyyy-MM'));
  
  console.log(`Generated ${uniqueMonths.length} months for display:`, uniqueMonths);

  // Create a lookup map for quick data access, with comprehensive validation
  const dataMap: Record<string, Record<string, number>> = {};
  const customerTotals: Record<string, number> = {};
  const monthTotals: Record<string, number> = {};
  let grandTotal = 0;

  // Initialize dataMap with empty values for all months and all customers
  allUniqueCustomers.forEach(customer => {
    dataMap[customer.code] = {};
    customerTotals[customer.code] = 0;
    
    uniqueMonths.forEach(month => {
      dataMap[customer.code][month] = 0;
      if (!monthTotals[month]) monthTotals[month] = 0;
    });
  });

  // Fill the dataMap with actual values and calculate totals
  let dataErrors = 0;
  data.forEach(item => {
    try {
      if (!item.customer_code || !item.year_month) {
        dataErrors++;
        return;
      }
      
      if (dataMap[item.customer_code] && uniqueMonths.includes(item.year_month)) {
        // Add the value to the dataMap
        dataMap[item.customer_code][item.year_month] = item.total_amount;
        
        // Update totals
        customerTotals[item.customer_code] += item.total_amount;
        monthTotals[item.year_month] += item.total_amount;
        grandTotal += item.total_amount;
      } else {
        dataErrors++;
        console.warn(`Data validation error: Missing mapping for customer ${item.customer_code} or month ${item.year_month}`);
      }
    } catch (err) {
      dataErrors++;
      console.error('Error processing data item:', item, err);
    }
  });
  
  if (dataErrors > 0) {
    console.warn(`Found ${dataErrors} data validation errors while processing turnover data`);
  }

  // Filter customers with no turnover (if showZeroTurnover is false)
  const customersWithTurnover = showZeroTurnover 
    ? allUniqueCustomers 
    : allUniqueCustomers.filter(customer => customerTotals[customer.code] > 0);

  const hiddenCustomersCount = allUniqueCustomers.length - customersWithTurnover.length;
  
  console.log(`Filtered out ${hiddenCustomersCount} customers with zero turnover`);
  console.log(`Showing ${customersWithTurnover.length} customers with non-zero turnover`);

  // Only sort customers that have turnover
  const sortedCustomers = [...customersWithTurnover].sort((a, b) => {
    if (sortField === 'customer_name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'total') {
      const aTotal = customerTotals[a.code] || 0;
      const bTotal = customerTotals[b.code] || 0;
      return sortDirection === 'asc' ? aTotal - bTotal : bTotal - aTotal;
    } else if (uniqueMonths.includes(sortField)) {
      const aValue = dataMap[a.code]?.[sortField] || 0;
      const bValue = dataMap[b.code]?.[sortField] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });
  
  console.log(`Processed data: ${sortedCustomers.length} customers across ${uniqueMonths.length} months`);
  
  return {
    uniqueCustomers: customersWithTurnover,
    uniqueMonths,
    dataMap,
    customerTotals,
    monthTotals,
    grandTotal,
    sortedCustomers,
    hiddenCustomersCount,
    sortField,
    sortDirection,
    handleSort
  };
};
