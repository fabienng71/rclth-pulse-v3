
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface SalespersonAnalysisData {
  customer_code: string;
  customer_name: string;
  search_name: string | null;
  monthly_data: {
    [yearMonth: string]: {
      amount: number;
      quantity: number;
    };
  };
  total_amount: number;
  total_quantity: number;
}

export interface SalespersonAnalysisFilters {
  salesperson_code: string;
  from_date: Date;
  to_date: Date;
  sort_field: string;
  sort_direction: 'asc' | 'desc';
}

const BATCH_SIZE = 800; // Stay under 1000 record limit

export const useSalespersonAnalysisData = (filters: SalespersonAnalysisFilters) => {
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['salesperson-analysis', filters],
    queryFn: async () => {
      console.log('Fetching salesperson analysis data:', filters);
      
      if (!filters.salesperson_code || !filters.from_date || !filters.to_date) {
        return { data: [], total_count: 0, summary: null };
      }

      // Format dates properly without timezone conversion
      const fromDateStr = format(filters.from_date, 'yyyy-MM-dd');
      const toDateStr = format(filters.to_date, 'yyyy-MM-dd');
      
      console.log('Date range:', { fromDateStr, toDateStr });

      // First, get the total count to determine how many batches we need
      const { count } = await supabase
        .from('consolidated_sales')
        .select('*', { count: 'exact', head: true })
        .eq('salesperson_code', filters.salesperson_code)
        .gte('posting_date', fromDateStr)
        .lte('posting_date', toDateStr);

      console.log('Total records to fetch:', count);

      if (!count) {
        return { data: [], total_count: 0, summary: null };
      }

      // Fetch all data in batches
      const allSalesData = [];
      const totalBatches = Math.ceil(count / BATCH_SIZE);
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * BATCH_SIZE;
        const end = start + BATCH_SIZE - 1;
        
        console.log(`Fetching batch ${i + 1}/${totalBatches} (records ${start}-${end})`);
        
        const { data: batchData, error: batchError } = await supabase
          .from('consolidated_sales')
          .select(`
            customer_code,
            customer_name,
            search_name,
            posting_date,
            amount,
            quantity
          `)
          .eq('salesperson_code', filters.salesperson_code)
          .gte('posting_date', fromDateStr)
          .lte('posting_date', toDateStr)
          .range(start, end);

        if (batchError) {
          console.error(`Error fetching batch ${i + 1}:`, batchError);
          throw batchError;
        }

        if (batchData) {
          allSalesData.push(...batchData);
        }
      }

      console.log('Total records fetched:', allSalesData.length);
      console.log('Sample raw data:', allSalesData.slice(0, 3));

      // Process the data into the required format
      const customerMap = new Map<string, SalespersonAnalysisData>();
      
      allSalesData.forEach((sale) => {
        const customerKey = sale.customer_code;
        // Use format function to avoid timezone issues
        const monthKey = format(new Date(sale.posting_date), 'yyyy-MM');
        
        if (!customerMap.has(customerKey)) {
          customerMap.set(customerKey, {
            customer_code: sale.customer_code,
            customer_name: sale.customer_name || '',
            search_name: sale.search_name,
            monthly_data: {},
            total_amount: 0,
            total_quantity: 0,
          });
        }
        
        const customer = customerMap.get(customerKey)!;
        
        if (!customer.monthly_data[monthKey]) {
          customer.monthly_data[monthKey] = { amount: 0, quantity: 0 };
        }
        
        customer.monthly_data[monthKey].amount += Number(sale.amount) || 0;
        customer.monthly_data[monthKey].quantity += Number(sale.quantity) || 0;
        customer.total_amount += Number(sale.amount) || 0;
        customer.total_quantity += Number(sale.quantity) || 0;
      });

      // Convert map to array and sort
      const processedData = Array.from(customerMap.values());
      
      console.log('Sample processed customer:', processedData[0]);
      console.log('Total customers:', processedData.length);
      
      // Apply sorting
      processedData.sort((a, b) => {
        const direction = filters.sort_direction === 'asc' ? 1 : -1;
        
        switch (filters.sort_field) {
          case 'customer_name':
            return direction * a.customer_name.localeCompare(b.customer_name);
          case 'total_amount':
            return direction * (a.total_amount - b.total_amount);
          case 'total_quantity':
            return direction * (a.total_quantity - b.total_quantity);
          default:
            return direction * a.customer_name.localeCompare(b.customer_name);
        }
      });

      // Calculate summary
      const summary = {
        total_customers: processedData.length,
        total_amount: processedData.reduce((sum, customer) => sum + customer.total_amount, 0),
        total_quantity: processedData.reduce((sum, customer) => sum + customer.total_quantity, 0),
      };

      console.log('Final processed data:', { 
        customerCount: processedData.length,
        summary 
      });

      return {
        data: processedData,
        total_count: processedData.length,
        summary,
      };
    },
    enabled: !!filters.salesperson_code && !!filters.from_date && !!filters.to_date,
  });

  const exportData = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      // For now, just log the export request
      console.log(`Exporting salesperson analysis data as ${format}:`, filters);
      // TODO: Implement actual export functionality
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    data: data?.data || [],
    total_count: data?.total_count || 0,
    summary: data?.summary,
    isLoading,
    error,
    exportData,
    isExporting,
  };
};
