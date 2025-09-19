
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface BudgetEntry {
  month: string;
  amount: number;
}

export interface Budget {
  id: string;
  fiscal_year: string;
  created_at: string;
  created_by: string;
  budget_entries?: BudgetEntry[];
}

export interface SalesData {
  total_turnover: number;
}

export const useBudgetData = () => {
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          budget_entries (
            month,
            amount
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching budgets:', error);
        throw error;
      }
      
      return data as Budget[];
    }
  });

  const { data: salesData } = useQuery<{ [key: string]: SalesData }>({
    queryKey: ['sales-by-fiscal-year'],
    queryFn: async () => {
      const salesByFiscalYear: { [key: string]: SalesData } = {};
      
      for (const budget of budgets || []) {
        const [startYr, endYr] = budget.fiscal_year.split('/');
        const startDate = new Date(`20${startYr}-04-01`);
        const endDate = new Date(`20${endYr}-03-31`);

        const { data, error } = await supabase.rpc('get_monthly_turnover', {
          from_date: startDate.toISOString(),
          to_date: endDate.toISOString()
        });

        if (!error && data) {
          salesByFiscalYear[budget.fiscal_year] = {
            total_turnover: data.reduce((sum, month) => sum + Number(month.total_turnover), 0)
          };
        }
      }
      
      return salesByFiscalYear;
    },
    enabled: !!budgets?.length
  });

  return {
    budgets,
    isLoadingBudgets,
    salesData
  };
};
