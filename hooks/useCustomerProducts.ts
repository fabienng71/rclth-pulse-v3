import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { CustomerProductData } from './useMonthlyReport';

interface UseCustomerProductsParams {
  year: number;
  month: number;
  customerCode: string;
  selectedSalesperson: string;
  includeCreditMemos: boolean;
  enabled?: boolean; // Only fetch when customer row is expanded
}

export const useCustomerProducts = ({
  year,
  month,
  customerCode,
  selectedSalesperson,
  includeCreditMemos,
  enabled = false
}: UseCustomerProductsParams) => {
  const { isAdmin, user, profile } = useAuthStore();

  // Determine which salesperson code to use (same logic as monthly report)
  const salespersonCode = (() => {
    if (!isAdmin) {
      // For non-admin users, always use their own salesperson code
      return profile?.spp_code || null;
    }
    
    // For admin users, use selected salesperson or null for "all"
    return selectedSalesperson === 'all' ? null : selectedSalesperson;
  })();

  const {
    data: rawData,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      'customer-products', 
      year, 
      month, 
      customerCode, 
      salespersonCode, 
      isAdmin, 
      includeCreditMemos
    ],
    queryFn: async () => {
      console.log('=== CUSTOMER PRODUCTS: Fetching product details ===', {
        year,
        month,
        customerCode,
        salespersonCode,
        isAdmin,
        includeCreditMemos
      });

      const { data, error } = await supabase.rpc('get_monthly_customer_products', {
        p_year: year,
        p_month: month,
        p_customer_code: customerCode,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memos: includeCreditMemos,
      });

      if (error) {
        console.error('=== CUSTOMER PRODUCTS: Database error ===', error);
        if (error.code === 'PGRST116') {
          throw new Error('Customer products function not found. Please check database migration status.');
        } else if (error.code === '42P01') {
          throw new Error('Database table not found. Please check if all required tables exist.');
        } else if (error.message?.includes('permission denied')) {
          throw new Error('Insufficient database permissions. Please contact your administrator.');
        }
        throw new Error(`Database error: ${error.message || 'Unknown error occurred'}`);
      }
      
      console.log('=== CUSTOMER PRODUCTS: Data received ===', data?.length || 0, 'products');
      
      return data || [];
    },
    enabled: enabled && !!user && !!customerCode && (!isAdmin ? !!salespersonCode && !!profile : true),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Process the data to ensure correct types
  const processedData: CustomerProductData[] = rawData?.map((row: unknown) => {
    const product = row as Record<string, unknown>;
    return {
      item_code: String(product.item_code || ''),
      item_description: String(product.item_description || 'Unknown Item'),
      quantity: Number(product.quantity || 0),
      amount: Number(product.amount || 0),
      unit_cost: Number(product.unit_cost || 0),
      total_cost: Number(product.total_cost || 0),
      margin_amount: Number(product.margin_amount || 0),
      margin_percent: Number(product.margin_percent || 0),
      transaction_count: Number(product.transaction_count || 0),
      avg_unit_price: Number(product.avg_unit_price || 0),
    };
  }) || [];

  return {
    data: processedData,
    isLoading,
    error,
    isFetching,
    debugInfo: {
      isAdmin,
      salespersonCode,
      customerCode,
      hasData: rawData?.length > 0,
      userProfile: profile?.spp_code,
      selectedSalesperson,
      filteringCorrectly: isAdmin 
        ? (selectedSalesperson === 'all' ? salespersonCode === null : salespersonCode === selectedSalesperson) 
        : salespersonCode === profile?.spp_code,
      queryParams: {
        p_year: year,
        p_month: month,
        p_customer_code: customerCode,
        p_salesperson_code: salespersonCode,
        p_is_admin: isAdmin,
        p_include_credit_memos: includeCreditMemos,
      },
      enabled
    }
  };
};