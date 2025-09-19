
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface MonthlyReportData {
  month_num: number;
  year_month: string;
  fiscal_month_order: number;
  is_past_or_current_month: boolean; // Added: indicator for past/current vs future months
  turnover: number;
  net_turnover: number; // Added: turnover minus credit memos
  gross_margin: number;
  net_gross_margin: number; // Added: gross margin minus credit memos
  budget: number;
  prev_year_turnover: number;
  customers_served: number;
  invoices_issued: number;
  avg_invoice_amount: number;
  net_avg_invoice_amount: number; // Added: average invoice amount net of credit memos
  working_days: number;
  budget_vs_actual_percent: number | null; // CORRECTED: (turnover - budget) / budget. Positive = exceeding budget, negative = below budget
  yoy_percent: number | null;
  daily_avg: number;
  net_daily_avg: number; // Added: daily average net of credit memos
  credit_memo_amount: number; // Added: credit memo amount for transparency
}

export interface YTDSummaryData {
  total_turnover: number;
  total_net_turnover: number; // Added: total turnover minus credit memos
  total_gross_margin: number;
  total_net_gross_margin: number; // Added: total gross margin minus credit memos
  total_budget: number;
  total_prev_year: number;
  total_customers_served: number;
  total_invoices_issued: number;
  total_working_days: number;
  total_credit_memos: number; // Added: total credit memo amount for transparency
  ytd_budget_vs_actual_percent: number | null; // CORRECTED: (turnover - budget) / budget. Positive = exceeding budget, negative = below budget
  ytd_yoy_percent: number | null;
  ytd_daily_avg: number;
  ytd_net_daily_avg: number; // Added: YTD daily average net of credit memos
  ytd_avg_invoice_amount: number; // Added: YTD average invoice amount
}

export interface ShortBusinessReportData {
  monthly_data: MonthlyReportData[];
  ytd_summary: YTDSummaryData;
}

export const useShortBusinessReport = (fiscalYear: number) => {
  const { isAdmin, user } = useAuthStore();

  return useQuery({
    queryKey: ['short-business-report-aligned', fiscalYear, isAdmin, user?.profile?.spp_code],
    queryFn: async () => {
      // First try the new aligned function
      let { data, error } = await supabase.rpc('get_executive_dashboard_summary', {
        p_fiscal_year: fiscalYear,
        p_is_admin: isAdmin,
        p_salesperson_code: isAdmin ? null : user?.profile?.spp_code || null,
      });

      // If new function doesn't exist yet, fallback to original with enhanced logging
      if (error && error.message?.includes('get_executive_dashboard_summary')) {
        console.log('New aligned function not deployed yet, using original function with enhanced logging');
        
        const fallbackResult = await supabase.rpc('get_short_business_report_data', {
          p_fiscal_year: fiscalYear,
          p_is_admin: isAdmin,
          p_salesperson_code: isAdmin ? null : user?.profile?.spp_code || null,
        });

        if (fallbackResult.error) {
          throw fallbackResult.error;
        }

        data = fallbackResult.data;
        error = null;
      }

      if (error) {
        console.error('Error fetching executive dashboard data:', error);
        throw error;
      }

      // Transform the data into our expected format
      const result: ShortBusinessReportData = {
        monthly_data: [],
        ytd_summary: {} as YTDSummaryData,
      };

      data?.forEach((item: any) => {
        if (item.analysis_type === 'monthly_data') {
          result.monthly_data = item.data || [];
        } else if (item.analysis_type === 'ytd_summary') {
          result.ytd_summary = item.data || {};
        }
      });

      console.log('Executive dashboard data summary:', {
        fiscalYear,
        isAdmin,
        salespersonCode: user?.profile?.spp_code,
        monthlyDataCount: result.monthly_data.length,
        ytdTotalTurnover: result.ytd_summary.total_turnover,
        sampleMonthlyTurnover: result.monthly_data.length > 0 ? result.monthly_data[0].turnover : 'N/A',
        dataSource: error ? 'fallback_function' : 'aligned_function'
      });

      return result;
    },
    enabled: !!user && fiscalYear > 0,
  });
};
