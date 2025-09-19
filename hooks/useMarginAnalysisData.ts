
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface MarginItem {
  item_code: string;
  description: string | null;
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
  posting_group?: string;
  vendor_code?: string;
  vendor_name?: string;
}

export interface MarginCustomer {
  customer_code: string;
  customer_name: string;
  search_name?: string | null; // Added search_name field
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
}

export interface MarginCategory {
  posting_group: string;
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
}

export interface MarginVendor {
  vendor_code: string;
  vendor_name: string;
  total_quantity: number;
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
}

export interface MarginOverallData {
  total_sales: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
  total_credit_memos?: number;
  credit_memo_amount?: number;
  credit_memo_quantity?: number;
  adjusted_sales?: number;
  adjusted_margin?: number;
  adjusted_margin_percent?: number;
}

export interface ProcessedMarginData {
  topItems: MarginItem[];
  lowItems: MarginItem[];
  topCustomers: MarginCustomer[];
  lowCustomers: MarginCustomer[];
  categories: MarginCategory[];
  vendors: MarginVendor[];
  overall: MarginOverallData | null;
  adjustedItems?: MarginItem[];
  adjustedCustomers?: MarginCustomer[];
}

interface CreditMemoData {
  item_code?: string | null;
  customer_code?: string | null;
  customer_name?: string | null;
  amount: number;
  quantity: number;
  posting_date: string;
}

export type ViewMode = 'standard' | 'adjusted';

export const useMarginAnalysisData = (year: number, month: number) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  
  const fetchMarginAnalysis = async () => {
    // Fetch sales data margin analysis
    const { data: marginData, error } = await supabase.rpc('get_direct_margin_analysis', {
      p_year: year,
      p_month: month
    });

    if (error) {
      console.error('Error fetching margin analysis data:', error);
      throw new Error('Failed to fetch margin data');
    }

    // Fetch credit memo data for the period - Fixed the SQL query format
    const formattedMonth = month.toString().padStart(2, '0');
    const startDate = `${year}-${formattedMonth}-01`;
    const endDate = month === 12 
      ? `${year + 1}-01-01` 
      : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    
    const { data: creditMemoData, error: creditMemoError } = await supabase
      .from('credit_memos')
      .select('item_code, customer_code, customer_name, amount, quantity, posting_date')
      .gte('posting_date', startDate)
      .lt('posting_date', endDate);
      
    if (creditMemoError) {
      console.error('Error fetching credit memo data:', creditMemoError);
      // Non-critical, continue with main data
    }

    // Process the raw data into structured margin analysis data
    const processedData: ProcessedMarginData = {
      topItems: [],
      lowItems: [],
      topCustomers: [],
      lowCustomers: [],
      categories: [],
      vendors: [],
      overall: null
    };

    if (marginData) {
      marginData.forEach((item: any) => {
        if (item.analysis_type === 'top_items') {
          processedData.topItems = Array.isArray(item.data) ? item.data : [];
        } else if (item.analysis_type === 'low_items') {
          processedData.lowItems = Array.isArray(item.data) ? item.data : [];
        } else if (item.analysis_type === 'top_customers') {
          processedData.topCustomers = Array.isArray(item.data) ? item.data : [];
        } else if (item.analysis_type === 'low_customers') {
          processedData.lowCustomers = Array.isArray(item.data) ? item.data : [];
        } else if (item.analysis_type === 'categories') {
          processedData.categories = Array.isArray(item.data) ? item.data : [];
        } else if (item.analysis_type === 'vendors') {
          processedData.vendors = Array.isArray(item.data) ? item.data : [];
        } else if (item.analysis_type === 'overall') {
          processedData.overall = item.data && item.data.length > 0 ? item.data[0] : null;
          
          // Process credit memo adjustments for overall data if available
          if (creditMemoData && creditMemoData.length > 0 && processedData.overall) {
            const totalCreditMemos = creditMemoData.reduce((sum, memo) => sum + (memo.amount || 0), 0);
            
            processedData.overall.total_credit_memos = totalCreditMemos;
            processedData.overall.adjusted_sales = Math.max(0, processedData.overall.total_sales - totalCreditMemos);
            processedData.overall.adjusted_margin = processedData.overall.adjusted_sales - processedData.overall.total_cost;
            processedData.overall.adjusted_margin_percent = processedData.overall.adjusted_sales > 0 
              ? (processedData.overall.adjusted_margin / processedData.overall.adjusted_sales) * 100
              : 0;
          }
        }
      });
    }

    // Process item-level and customer-level credit memo adjustments
    // Create new arrays instead of mutating the existing ones to avoid deep type instantiation
    if (creditMemoData && creditMemoData.length > 0) {
      // Create maps for credit memo calculations
      const itemCreditMemos = new Map<string, { amount: number, quantity: number }>();
      const customerCreditMemos = new Map<string, { amount: number, quantity: number }>();
      
      // Safely process credit memo data
      creditMemoData.forEach((memo: CreditMemoData) => {
        // Process item-level credit memos
        if (memo.item_code) {
          const existing = itemCreditMemos.get(memo.item_code) || { amount: 0, quantity: 0 };
          itemCreditMemos.set(memo.item_code, {
            amount: existing.amount + (memo.amount || 0),
            quantity: existing.quantity + (memo.quantity || 0)
          });
        }
        
        // Process customer-level credit memos
        if (memo.customer_code) {
          const existing = customerCreditMemos.get(memo.customer_code) || { amount: 0, quantity: 0 };
          customerCreditMemos.set(memo.customer_code, {
            amount: existing.amount + (memo.amount || 0),
            quantity: existing.quantity + (memo.quantity || 0)
          });
        }
      });

      // Create adjusted items data using a simple transformation approach
      if (processedData.topItems && processedData.topItems.length > 0) {
        const adjustedItems: MarginItem[] = [];
        
        for (const item of processedData.topItems) {
          if (!item || !item.item_code) {
            adjustedItems.push(item);
            continue;
          }
          
          const creditMemo = itemCreditMemos.get(item.item_code);
          if (!creditMemo) {
            adjustedItems.push(item);
            continue;
          }
          
          // Make sure credit memo doesn't exceed the original sales amount
          const creditMemoAmount = Math.min(creditMemo.amount, item.total_sales);
          const adjustedSales = Math.max(0, item.total_sales - creditMemoAmount);
          const adjustedQuantity = Math.max(0, item.total_quantity - creditMemo.quantity);
          
          // Recalculate margin based on adjusted sales
          const adjustedMargin = adjustedSales - item.total_cost;
          // Calculate margin percent, ensuring we don't divide by zero
          const adjustedMarginPercent = adjustedSales > 0 
            ? (adjustedMargin / adjustedSales) * 100 
            : 0;
          
          adjustedItems.push({
            ...item,
            total_sales: adjustedSales,
            margin: adjustedMargin,
            margin_percent: adjustedMarginPercent,
            total_quantity: adjustedQuantity
          });
        }
        
        // Sort the adjusted items by margin percent
        processedData.adjustedItems = adjustedItems.sort((a, b) => b.margin_percent - a.margin_percent);
      }

      // Create adjusted customers data using a simple transformation approach
      if (processedData.topCustomers && processedData.topCustomers.length > 0) {
        const adjustedCustomers: MarginCustomer[] = [];
        
        for (const customer of processedData.topCustomers) {
          if (!customer || !customer.customer_code) {
            adjustedCustomers.push(customer);
            continue;
          }
          
          const creditMemo = customerCreditMemos.get(customer.customer_code);
          if (!creditMemo) {
            adjustedCustomers.push(customer);
            continue;
          }
          
          // Make sure credit memo doesn't exceed the original sales amount
          const creditMemoAmount = Math.min(creditMemo.amount, customer.total_sales);
          const adjustedSales = Math.max(0, customer.total_sales - creditMemoAmount);
          const adjustedQuantity = Math.max(0, customer.total_quantity - creditMemo.quantity);
          
          // Recalculate margin based on adjusted sales
          const adjustedMargin = adjustedSales - customer.total_cost;
          // Calculate margin percent, ensuring we don't divide by zero
          const adjustedMarginPercent = adjustedSales > 0 
            ? (adjustedMargin / adjustedSales) * 100 
            : 0;
          
          adjustedCustomers.push({
            ...customer,
            total_sales: adjustedSales,
            margin: adjustedMargin,
            margin_percent: adjustedMarginPercent,
            total_quantity: adjustedQuantity
          });
        }
        
        // Sort the adjusted customers by margin percent
        processedData.adjustedCustomers = adjustedCustomers.sort((a, b) => b.margin_percent - a.margin_percent);
      }
    }

    return processedData;
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['marginAnalysis', year, month],
    queryFn: fetchMarginAnalysis,
  });

  const refreshAnalyticsData = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Data refreshed',
        description: 'Margin analysis data has been updated.',
      });
    } catch (err) {
      toast({
        title: 'Refresh failed',
        description: 'Could not refresh margin analysis data.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    isRefreshing,
    refreshAnalyticsData,
    viewMode,
    setViewMode
  };
};
