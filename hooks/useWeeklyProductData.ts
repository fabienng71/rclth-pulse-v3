
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentWeekNumber } from '@/utils/weekUtils';

export interface WeeklyProduct {
  item_code: string;
  description: string;
  total_quantity: number;
  total_turnover: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
}

export interface WeeklyNewCustomer {
  customer_code: string;
  customer_name: string;
  search_name: string;
  first_transaction_date: string;
}

export const useWeeklyProductData = (salespersonCode?: string) => {
  const { isAdmin, profile } = useAuthStore();
  const [topProductsByQuantity, setTopProductsByQuantity] = useState<WeeklyProduct[]>([]);
  const [topProductsByTurnover, setTopProductsByTurnover] = useState<WeeklyProduct[]>([]);
  const [newCustomers, setNewCustomers] = useState<WeeklyNewCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const currentYear = new Date().getFullYear();
        const currentWeek = await getCurrentWeekNumber();
        
        const effectiveSalespersonCode = salespersonCode === "all" ? null : (salespersonCode || profile?.spp_code);

        console.log('Fetching weekly data for:', { currentYear, currentWeek, effectiveSalespersonCode, isAdmin });

        // Fetch top products by quantity
        const { data: quantityData, error: quantityError } = await supabase.rpc(
          'get_weekly_top_products_by_quantity',
          {
            p_year: currentYear,
            p_week: currentWeek,
            p_salesperson_code: effectiveSalespersonCode,
            p_is_admin: isAdmin,
            p_limit: 5
          }
        );

        if (quantityError) throw quantityError;

        // Fetch top products by turnover
        const { data: turnoverData, error: turnoverError } = await supabase.rpc(
          'get_weekly_top_products_by_turnover',
          {
            p_year: currentYear,
            p_week: currentWeek,
            p_salesperson_code: effectiveSalespersonCode,
            p_is_admin: isAdmin,
            p_limit: 5
          }
        );

        if (turnoverError) throw turnoverError;

        // Fetch new customers for this week
        const { data: customersData, error: customersError } = await supabase.rpc(
          'get_weekly_new_customers',
          {
            p_year: currentYear,
            p_week: currentWeek
          }
        );

        if (customersError) throw customersError;

        setTopProductsByQuantity(quantityData || []);
        setTopProductsByTurnover(turnoverData || []);
        setNewCustomers(customersData || []);

        console.log('Weekly data fetched:', {
          quantity: quantityData?.length,
          turnover: turnoverData?.length,
          customers: customersData?.length
        });

      } catch (err) {
        console.error('Error fetching weekly data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch weekly data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklyData();
  }, [salespersonCode, isAdmin, profile?.spp_code]);

  return {
    topProductsByQuantity,
    topProductsByTurnover,
    newCustomers,
    isLoading,
    error
  };
};
