
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, addMonths, parse } from 'date-fns';

export interface NewCustomer {
  year_month: string;
  customer_code: string;
  customer_name: string;
  search_name: string | null;
  salesperson_code: string | null;
  first_transaction_date: string;
}

export interface MonthlySummary {
  year_month: string;
  new_customer_count: number;
  cumulative_customer_count: number;
}

export interface NewCustomersData {
  customers: NewCustomer[];
  summary: MonthlySummary[];
  isLoading: boolean;
  error: Error | null;
}

export const useNewCustomersData = (monthsToFetch = 12, specificMonth?: string) => {
  const [data, setData] = useState<NewCustomersData>({
    customers: [],
    summary: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching new customers data:', { monthsToFetch, specificMonth });
        
        // Calculate dates
        const today = new Date();
        let fromDate: Date;
        let toDate: Date;
        
        if (specificMonth) {
          // If a specific month is requested, focus on that month
          // Parse the specificMonth string (expected format: "YYYY-MM")
          const normalizedMonth = specificMonth.trim();
          console.log('Normalized specific month:', normalizedMonth);
          
          try {
            // Parse the first day of the month
            const firstDayOfMonth = parse(`${normalizedMonth}-01`, 'yyyy-MM-dd', new Date());
            console.log('Parsed first day of month:', firstDayOfMonth);
            
            // Set range to cover the entire month plus some buffer
            fromDate = subMonths(firstDayOfMonth, 1);
            toDate = addMonths(firstDayOfMonth, 1);
            
            console.log('Date range for specific month:', { 
              fromDate: fromDate.toISOString(), 
              toDate: toDate.toISOString() 
            });
          } catch (parseError) {
            console.error('Error parsing specific month:', parseError);
            // Fallback to default range if parsing fails
            fromDate = subMonths(today, monthsToFetch + 1);
            toDate = addMonths(today, 2);
          }
        } else {
          // Default range
          fromDate = subMonths(today, monthsToFetch + 1);
          toDate = addMonths(today, 2);
        }
        
        const formattedFromDate = format(fromDate, 'yyyy-MM-dd');
        const formattedToDate = format(toDate, 'yyyy-MM-dd');
        
        console.log('Querying date range:', { formattedFromDate, formattedToDate });

        // Fetch new customers
        const { data: customersData, error: customersError } = await supabase.rpc(
          'get_new_customers_by_month',
          {
            from_date: formattedFromDate,
            to_date: formattedToDate,
          }
        );

        if (customersError) throw customersError;

        // Ensure consistent formatting for year_month in customer data
        const formattedCustomersData = customersData.map(customer => ({
          ...customer,
          // Normalize the year_month format to ensure consistency
          year_month: customer.year_month.trim(),
        }));

        // Fetch summary data
        const { data: summaryData, error: summaryError } = await supabase.rpc(
          'get_new_customers_monthly_summary',
          {
            from_date: formattedFromDate,
            to_date: formattedToDate,
          }
        );

        if (summaryError) throw summaryError;

        // Normalize the year_month format in summary data too
        const formattedSummaryData = summaryData.map(item => ({
          ...item,
          year_month: item.year_month.trim(),
        }));

        // Filter customers by specific month if requested
        let filteredCustomers = formattedCustomersData;
        if (specificMonth) {
          const normalizedSpecificMonth = specificMonth.trim();
          console.log('Filtering customers for specific month:', normalizedSpecificMonth);
          console.log('Available months before filtering:', 
            [...new Set(formattedCustomersData.map(c => c.year_month))]);
          
          filteredCustomers = formattedCustomersData.filter(customer => 
            customer.year_month.toLowerCase() === normalizedSpecificMonth.toLowerCase()
          );
          
          console.log('Filtered customer count:', filteredCustomers.length);
          console.log('Filtered customer data:', filteredCustomers);
        }

        console.log('All fetched customer data:', formattedCustomersData);
        console.log('Fetched summary data:', formattedSummaryData);
        console.log('All available months in data:', 
          [...new Set(formattedCustomersData.map(c => c.year_month))]);

        setData({
          customers: filteredCustomers,
          summary: formattedSummaryData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching new customers data:', error);
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error occurred'),
        }));
      }
    };

    fetchData();
  }, [monthsToFetch, specificMonth]);

  return data;
};
