
import { useState, useEffect } from 'react';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';
import { MonthlyItemData } from '@/types/sales';
import { useCogsData } from './sales/useCogsData';
import { useSalesData } from './sales/useSalesData';
import { processItemSalesData } from './sales/processItemSalesData';

export const useItemSalesData = (itemCodes: string[]) => {
  // Initialize dates: from 12 months ago to current month
  const [fromDate, setFromDate] = useState(startOfMonth(subMonths(new Date(), 12)));
  const [toDate, setToDate] = useState(endOfMonth(new Date()));
  const [monthlyData, setMonthlyData] = useState<MonthlyItemData[]>([]);
  
  // Fetch COGS data
  const { cogsMap, error: cogsError } = useCogsData(itemCodes);
  
  // Fetch sales data with batch processing
  const { 
    salesData, 
    isLoading, 
    error: salesError 
  } = useSalesData(itemCodes, fromDate, toDate);
  
  // Process data whenever sales data or COGS data changes
  useEffect(() => {
    if (salesData.length > 0) {
      console.log(`Processing ${salesData.length} sales records from ${fromDate.toISOString()} to ${toDate.toISOString()}`);
      const processed = processItemSalesData(salesData, cogsMap);
      setMonthlyData(processed);
    } else {
      console.log("No sales data to process");
      setMonthlyData([]);
    }
  }, [salesData, cogsMap, fromDate, toDate]);
  
  // Combine errors
  const error = salesError || cogsError;
  
  return {
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    monthlyData,
    isLoading,
    error
  };
};
