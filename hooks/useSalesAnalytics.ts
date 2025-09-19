import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

// Types for analytics data
export interface CustomerChurnAnalysis {
  customer_code: string;
  customer_name: string | null;
  salesperson_code: string | null;
  last_order_date: string | null;
  weeks_since_last_order: number;
  churn_status: 'CHURNED' | 'AT_RISK' | 'DECLINING' | 'ACTIVE';
  risk_score: number;
  historical_value: number | null;
  recent_value: number | null;
  value_trend: 'GROWING' | 'DECLINING' | 'STABLE';
  recovery_priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggested_action: string | null;
}

export interface NewCustomerAnalysis {
  customer_code: string;
  customer_name: string | null;
  salesperson_code: string | null;
  first_order_date: string | null;
  first_week_value: number | null;
  transaction_count: number;
  avg_order_value: number | null;
  customer_potential: 'HIGH_POTENTIAL' | 'MEDIUM_POTENTIAL' | 'LOW_POTENTIAL' | 'MICRO_POTENTIAL';
  onboarding_status: 'WELL_ENGAGED' | 'MODERATELY_ENGAGED' | 'MINIMALLY_ENGAGED' | 'NOT_ENGAGED';
  suggested_action: string | null;
}

export interface ProductPerformanceAnalysis {
  item_code: string;
  item_description: string | null;
  product_status: 'LOST' | 'DECLINING' | 'SURGING' | 'DROPPING' | 'NEW' | 'STABLE';
  weeks_since_last_sale: number;
  current_volume: number | null;
  previous_volume: number | null;
  trend_volume: number | null;
  volume_change_percent: number | null;
  volume_trend_percent: number | null;
  current_turnover: number | null;
  previous_turnover: number | null;
  trend_turnover: number | null;
  turnover_change_percent: number | null;
  turnover_trend_percent: number | null;
  customer_count: number;
  performance_rating: 'HIGH_PERFORMER' | 'GOOD_PERFORMER' | 'AVERAGE_PERFORMER' | 'LOW_PERFORMER';
  suggested_action: string | null;
}

export interface SalespersonPerformanceAnalysis {
  salesperson_code: string;
  total_customers: number;
  total_turnover: number;
  total_margin: number;
  margin_percent: number;
  avg_customer_value: number;
  avg_order_value: number;
  new_customers: number;
  at_risk_customers: number;
  churned_customers: number;
  growing_customers: number;
  customer_health_score: number;
  performance_rating: 'TOP_PERFORMER' | 'GOOD_PERFORMER' | 'AVERAGE_PERFORMER' | 'NEEDS_IMPROVEMENT';
  turnover_rank: number;
  health_rank: number;
  target_achievement_percent: number | null;
  suggested_focus_areas: string[];
}

export interface PredictiveChurnAnalysis {
  customer_code: string;
  customer_name: string;
  salesperson_code: string;
  churn_probability: number;
  key_risk_factors: string[];
  predicted_churn_week: number;
  preventive_actions: string[];
  customer_value_at_risk: number;
}

export interface ExecutiveSummary {
  metric_category: string;
  metric_name: string;
  metric_value: number;
  metric_unit: string;
  comparison_value: number;
  comparison_period: string;
  trend_direction: 'UP' | 'DOWN' | 'STABLE';
  alert_level: 'HIGH' | 'MEDIUM' | 'LOW';
  insight_summary: string;
}

export interface DataValidation {
  validation_category: string;
  validation_type: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  issue_count: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  description: string;
  suggested_action: string;
}

// Hook for customer churn analysis with monthly optimization
export const useCustomerChurnAnalysis = (year: number, week: number, salespersonCode?: string, month?: number) => {
  const { isAdmin, profile } = useAuthStore();
  const effectiveSalesperson = salespersonCode || (isAdmin ? null : profile?.spp_code);
  const isMonthlyAnalysis = month && week !== 0 && year && month >= 1 && month <= 12;

  return useQuery({
    queryKey: ['customer-churn-analysis', year, week, effectiveSalesperson, month, isMonthlyAnalysis],
    queryFn: async (): Promise<CustomerChurnAnalysis[]> => {
      try {
        if (isMonthlyAnalysis) {
          // Use optimized monthly churn analysis
          const { data, error } = await supabase.rpc('get_monthly_customer_churn_analysis', {
            p_year: year,
            p_month: month,
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching monthly customer churn analysis:', error);
            // Fallback to weekly analysis
            return [];
          }

          return data || [];
        } else {
          // Regular weekly analysis
          const { data, error } = await supabase.rpc('get_customer_churn_analysis', {
            p_year: year || new Date().getFullYear(),
            p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching customer churn analysis:', error);
            return [];
          }

          return data || [];
        }
      } catch (err) {
        console.error('Unexpected error in customer churn analysis:', err);
        return [];
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook for new customer analysis with optimized monthly analysis
export const useNewCustomerAnalysis = (year: number, week: number, salespersonCode?: string, month?: number) => {
  const { isAdmin, profile } = useAuthStore();
  const effectiveSalesperson = salespersonCode || (isAdmin ? null : profile?.spp_code);
  const isMonthlyAnalysis = month && week !== 0 && year && month >= 1 && month <= 12;

  return useQuery({
    queryKey: ['new-customer-analysis', year, week, effectiveSalesperson, month, isMonthlyAnalysis],
    queryFn: async (): Promise<NewCustomerAnalysis[]> => {
      try {
        if (isMonthlyAnalysis) {
          // Use optimized monthly function - single database call instead of multiple weekly calls
          const { data, error } = await supabase.rpc('get_monthly_new_customer_analysis', {
            p_year: year,
            p_month: month,
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching monthly new customer analysis:', error);
            // Fallback to weekly analysis if monthly function fails
            return [];
          }

          return data || [];
        } else {
          // Regular weekly analysis
          const { data, error } = await supabase.rpc('get_new_customer_analysis', {
            p_year: year || new Date().getFullYear(),
            p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching new customer analysis:', error);
            return [];
          }

          return data || [];
        }
      } catch (err) {
        console.error('Unexpected error in new customer analysis:', err);
        return [];
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook for product performance analysis with monthly support
export const useProductPerformanceAnalysis = (year: number, week: number, salespersonCode?: string, month?: number) => {
  const { isAdmin, profile } = useAuthStore();
  const effectiveSalesperson = salespersonCode || (isAdmin ? null : profile?.spp_code);
  const isMonthlyAnalysis = month && week !== 0 && year && month >= 1 && month <= 12;

  return useQuery({
    queryKey: ['product-performance-analysis', year, week, effectiveSalesperson, month, isMonthlyAnalysis],
    queryFn: async (): Promise<ProductPerformanceAnalysis[]> => {
      try {
        if (isMonthlyAnalysis) {
          // For monthly analysis, aggregate data from all weeks in the month
          const monthStart = new Date(year, month - 1, 1);
          const monthEnd = new Date(year, month, 0);
          const yearStart = new Date(year, 0, 1);
          
          // Calculate start and end week numbers for the month
          const startWeek = Math.ceil((monthStart.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const endWeek = Math.ceil((monthEnd.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          
          // Fetch data for all weeks in the month and aggregate
          const weeklyPromises = [];
          for (let w = Math.max(1, startWeek); w <= Math.min(53, endWeek); w++) {
            weeklyPromises.push(
              supabase.rpc('get_product_performance_analysis', {
                p_year: year,
                p_week: w,
                p_salesperson_code: effectiveSalesperson || null
              })
            );
          }
          
          const weeklyResults = await Promise.all(weeklyPromises);
          
          // Aggregate product performance data across all weeks
          const productMap = new Map<string, ProductPerformanceAnalysis>();
          
          weeklyResults.forEach(({ data: weekData }) => {
            if (weekData && Array.isArray(weekData)) {
              weekData.forEach((product: ProductPerformanceAnalysis) => {
                const existingProduct = productMap.get(product.item_code);
                if (!existingProduct) {
                  productMap.set(product.item_code, { ...product });
                } else {
                  // Aggregate the metrics
                  existingProduct.current_volume += product.current_volume || 0;
                  existingProduct.current_turnover += product.current_turnover || 0;
                  existingProduct.previous_volume += product.previous_volume || 0;
                  existingProduct.previous_turnover += product.previous_turnover || 0;
                  existingProduct.trend_volume += product.trend_volume || 0;
                  existingProduct.trend_turnover += product.trend_turnover || 0;
                  existingProduct.customer_count = Math.max(existingProduct.customer_count, product.customer_count);
                  
                  // Update weeks since last sale to the minimum (most recent)
                  if (product.weeks_since_last_sale < existingProduct.weeks_since_last_sale) {
                    existingProduct.weeks_since_last_sale = product.weeks_since_last_sale;
                  }
                  
                  // Recalculate percentages for previous period comparison
                  if (existingProduct.previous_volume > 0) {
                    existingProduct.volume_change_percent = ((existingProduct.current_volume - existingProduct.previous_volume) * 100.0 / existingProduct.previous_volume);
                  }
                  if (existingProduct.previous_turnover > 0) {
                    existingProduct.turnover_change_percent = ((existingProduct.current_turnover - existingProduct.previous_turnover) * 100.0 / existingProduct.previous_turnover);
                  }
                  
                  // Recalculate percentages for trend comparison
                  if (existingProduct.trend_volume > 0) {
                    existingProduct.volume_trend_percent = ((existingProduct.current_volume - existingProduct.trend_volume) * 100.0 / existingProduct.trend_volume);
                  }
                  if (existingProduct.trend_turnover > 0) {
                    existingProduct.turnover_trend_percent = ((existingProduct.current_turnover - existingProduct.trend_turnover) * 100.0 / existingProduct.trend_turnover);
                  }
                  
                  // Update status based on aggregated data
                  if (existingProduct.weeks_since_last_sale > 8) {
                    existingProduct.product_status = 'LOST';
                  } else if (existingProduct.current_volume > existingProduct.trend_volume * 1.5) {
                    existingProduct.product_status = 'SURGING';
                  } else if (existingProduct.current_volume < existingProduct.trend_volume * 0.5) {
                    existingProduct.product_status = 'DROPPING';
                  } else {
                    existingProduct.product_status = 'STABLE';
                  }
                  
                  // Update performance rating
                  if (existingProduct.current_turnover > 10000 && existingProduct.current_volume > existingProduct.trend_volume * 1.2) {
                    existingProduct.performance_rating = 'HIGH_PERFORMER';
                  } else if (existingProduct.current_turnover > 5000) {
                    existingProduct.performance_rating = 'GOOD_PERFORMER';
                  } else if (existingProduct.current_turnover > 0) {
                    existingProduct.performance_rating = 'AVERAGE_PERFORMER';
                  } else {
                    existingProduct.performance_rating = 'LOW_PERFORMER';
                  }
                }
              });
            }
          });
          
          return Array.from(productMap.values()).sort((a, b) => (b.current_turnover || 0) - (a.current_turnover || 0));
        } else {
          // Regular weekly analysis
          const { data, error } = await supabase.rpc('get_product_performance_analysis', {
            p_year: year || new Date().getFullYear(),
            p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching product performance analysis:', error);
            return [];
          }

          return data || [];
        }
      } catch (err) {
        console.error('Unexpected error in product performance analysis:', err);
        return [];
      }
    },
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook for salesperson performance analysis
export const useSalespersonPerformanceAnalysis = (year: number, week: number, salespersonCode?: string, month?: number) => {
  const { isAdmin, profile } = useAuthStore();
  const effectiveSalesperson = salespersonCode || (isAdmin ? null : profile?.spp_code);

  return useQuery({
    queryKey: ['salesperson-performance-analysis', year, week, effectiveSalesperson, month],
    queryFn: async (): Promise<SalespersonPerformanceAnalysis[]> => {
      try {
        // If month is provided, use monthly analysis with fixed month boundaries
        if (month) {
          const { data, error } = await supabase.rpc('get_monthly_salesperson_performance_analysis_fixed', {
            p_year: year || new Date().getFullYear(),
            p_month: month,
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching monthly salesperson performance analysis:', error);
            return [];
          }

          return data || [];
        } else {
          // Use weekly analysis
          const { data, error } = await supabase.rpc('get_salesperson_performance_analysis', {
            p_year: year || new Date().getFullYear(),
            p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching salesperson performance analysis:', error);
            return [];
          }

          return data || [];
        }
      } catch (err) {
        console.error('Unexpected error in salesperson performance analysis:', err);
        return [];
      }
    },
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook for predictive churn analysis
export const usePredictiveChurnAnalysis = (year: number, week: number, salespersonCode?: string) => {
  const { isAdmin, profile } = useAuthStore();
  const effectiveSalesperson = salespersonCode || (isAdmin ? null : profile?.spp_code);

  return useQuery({
    queryKey: ['predictive-churn-analysis', year, week, effectiveSalesperson],
    queryFn: async (): Promise<PredictiveChurnAnalysis[]> => {
      try {
        const { data, error } = await supabase.rpc('get_predictive_churn_analysis', {
          p_year: year || new Date().getFullYear(),
          p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
          p_salesperson_code: effectiveSalesperson || null
        });

        if (error) {
          console.error('Error fetching predictive churn analysis:', error);
          return [];
        }

        return data || [];
      } catch (err) {
        console.error('Unexpected error in predictive churn analysis:', err);
        return [];
      }
    },
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook for executive summary with monthly aggregation support
export const useExecutiveSummary = (year: number, week: number, salespersonCode?: string, month?: number) => {
  const { isAdmin, profile } = useAuthStore();
  const effectiveSalesperson = salespersonCode || (isAdmin ? null : profile?.spp_code);
  const isMonthlyAnalysis = month !== undefined && year && month >= 1 && month <= 12;

  return useQuery({
    queryKey: ['executive-summary', year, week, effectiveSalesperson, month, isMonthlyAnalysis],
    queryFn: async (): Promise<ExecutiveSummary[]> => {
      try {
        if (isMonthlyAnalysis) {
          // For monthly analysis, use the same date logic as dashboard to avoid discrepancies
          const monthStart = new Date(year, month - 1, 1);
          const monthEnd = new Date(year, month, 0);
          
          // Instead of aggregating weekly data, call the dashboard function directly
          // to ensure we're using the exact same data source and date boundaries
          const { data: dashboardData, error: dashboardError } = await supabase.rpc('get_enhanced_monthly_turnover', {
            from_date: monthStart.toISOString(),
            to_date: monthEnd.toISOString(),
            is_admin: !effectiveSalesperson,
            user_spp_code: effectiveSalesperson || '',
            include_delivery_fees: false
          });
          
          if (dashboardError) {
            console.error('Error fetching monthly dashboard data:', dashboardError);
            return [];
          }
          
          // Filter to get only the current month's data
          const currentMonthData = dashboardData?.filter(item => {
            const itemMonth = `${year}-${month.toString().padStart(2, '0')}`;
            return item.month === itemMonth;
          }) || [];
          
          if (currentMonthData.length === 0) {
            return [];
          }
          
          const monthData = currentMonthData[0];
          
          // Get previous month data for comparison
          const prevMonthStart = new Date(year, month - 2, 1);
          const prevMonthEnd = new Date(year, month - 1, 0);
          
          const { data: prevMonthData } = await supabase.rpc('get_enhanced_monthly_turnover', {
            from_date: prevMonthStart.toISOString(),
            to_date: prevMonthEnd.toISOString(),
            is_admin: !effectiveSalesperson,
            user_spp_code: effectiveSalesperson || '',
            include_delivery_fees: false
          });
          
          const prevData = prevMonthData?.[0] || { total_turnover: 0, total_margin: 0, total_quantity: 0 };
          
          // Get customer metrics for the month by aggregating weekly data
          const yearStart = new Date(year, 0, 1);
          
          // Calculate start and end week numbers for the month
          const startWeek = Math.ceil((monthStart.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const endWeek = Math.ceil((monthEnd.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          
          // Fetch customer churn data for all weeks in the month
          const weeklyChurnPromises = [];
          for (let w = Math.max(1, startWeek); w <= Math.min(53, endWeek); w++) {
            weeklyChurnPromises.push(
              supabase.rpc('get_customer_churn_analysis', {
                p_year: year,
                p_week: w,
                p_salesperson_code: effectiveSalesperson || null
              })
            );
          }
          
          const weeklyChurnResults = await Promise.all(weeklyChurnPromises);
          
          // Aggregate customer metrics
          const allCustomers = new Map<string, any>();
          weeklyChurnResults.forEach(({ data: weekData }) => {
            if (weekData && Array.isArray(weekData)) {
              weekData.forEach((customer: any) => {
                // Keep the most recent customer data
                if (!allCustomers.has(customer.customer_code) || 
                    customer.weeks_since_last_order < allCustomers.get(customer.customer_code).weeks_since_last_order) {
                  allCustomers.set(customer.customer_code, customer);
                }
              });
            }
          });
          
          const customers = Array.from(allCustomers.values());
          const activeCustomers = customers.filter(c => c.churn_status === 'ACTIVE' || c.churn_status === 'DECLINING').length;
          const atRiskCustomers = customers.filter(c => c.churn_status === 'AT_RISK').length;
          
          // Get sales data for average order value calculation
          let salesQuery = supabase
            .from('salesdata')
            .select('amount, posting_date')
            .gte('posting_date', monthStart.toISOString().split('T')[0])
            .lte('posting_date', monthEnd.toISOString().split('T')[0]);
          
          if (effectiveSalesperson) {
            salesQuery = salesQuery.eq('salesperson_code', effectiveSalesperson);
          }
          
          const { data: salesData } = await salesQuery;
          
          const totalTransactions = salesData?.length || 0;
          const totalRevenue = salesData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
          const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
          
          // Get previous month sales data for comparison
          let prevSalesQuery = supabase
            .from('salesdata')
            .select('amount, posting_date')
            .gte('posting_date', prevMonthStart.toISOString().split('T')[0])
            .lte('posting_date', prevMonthEnd.toISOString().split('T')[0]);
          
          if (effectiveSalesperson) {
            prevSalesQuery = prevSalesQuery.eq('salesperson_code', effectiveSalesperson);
          }
          
          const { data: prevSalesData } = await prevSalesQuery;
          
          const prevTotalTransactions = prevSalesData?.length || 0;
          const prevTotalRevenue = prevSalesData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
          const prevAvgOrderValue = prevTotalTransactions > 0 ? prevTotalRevenue / prevTotalTransactions : 0;
          
          // Get previous month customer data for comparison
          const prevStartWeek = Math.ceil((prevMonthStart.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const prevEndWeek = Math.ceil((prevMonthEnd.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          
          const prevWeeklyChurnPromises = [];
          for (let w = Math.max(1, prevStartWeek); w <= Math.min(53, prevEndWeek); w++) {
            prevWeeklyChurnPromises.push(
              supabase.rpc('get_customer_churn_analysis', {
                p_year: year,
                p_week: w,
                p_salesperson_code: effectiveSalesperson || null
              })
            );
          }
          
          const prevWeeklyChurnResults = await Promise.all(prevWeeklyChurnPromises);
          
          const prevAllCustomers = new Map<string, any>();
          prevWeeklyChurnResults.forEach(({ data: weekData }) => {
            if (weekData && Array.isArray(weekData)) {
              weekData.forEach((customer: any) => {
                if (!prevAllCustomers.has(customer.customer_code) || 
                    customer.weeks_since_last_order < prevAllCustomers.get(customer.customer_code).weeks_since_last_order) {
                  prevAllCustomers.set(customer.customer_code, customer);
                }
              });
            }
          });
          
          const prevCustomers = Array.from(prevAllCustomers.values());
          const prevActiveCustomers = prevCustomers.filter(c => c.churn_status === 'ACTIVE' || c.churn_status === 'DECLINING').length;
          const prevAtRiskCustomers = prevCustomers.filter(c => c.churn_status === 'AT_RISK').length;

          // Create executive summary metrics using the same data as dashboard
          const executiveSummaryData = [
            {
              metric_category: 'Revenue Metrics',
              metric_name: `${getMonthName(month)} ${year} Turnover`,
              metric_value: monthData.total_turnover || 0,
              metric_unit: 'currency',
              comparison_value: prevData.total_turnover || 0,
              comparison_period: 'Previous Month',
              trend_direction: (monthData.total_turnover || 0) > (prevData.total_turnover || 0) ? 'UP' : 
                              (monthData.total_turnover || 0) < (prevData.total_turnover || 0) ? 'DOWN' : 'STABLE',
              alert_level: (monthData.total_turnover || 0) < (prevData.total_turnover || 0) * 0.9 ? 'HIGH' : 
                          (monthData.total_turnover || 0) < (prevData.total_turnover || 0) * 0.95 ? 'MEDIUM' : 'LOW',
              insight_summary: (monthData.total_turnover || 0) > (prevData.total_turnover || 0) * 1.1 ? 
                              'Strong turnover growth vs previous month' : 
                              (monthData.total_turnover || 0) < (prevData.total_turnover || 0) * 0.9 ? 
                              'Significant turnover decline vs previous month' : 
                              'Turnover relatively stable vs previous month'
            },
            {
              metric_category: 'Margin Metrics',
              metric_name: `${getMonthName(month)} ${year} Total Margin`,
              metric_value: monthData.total_margin || 0,
              metric_unit: 'currency',
              comparison_value: prevData.total_margin || 0,
              comparison_period: 'Previous Month',
              trend_direction: (monthData.total_margin || 0) > (prevData.total_margin || 0) ? 'UP' : 
                              (monthData.total_margin || 0) < (prevData.total_margin || 0) ? 'DOWN' : 'STABLE',
              alert_level: (monthData.total_margin || 0) < (prevData.total_margin || 0) * 0.9 ? 'HIGH' : 
                          (monthData.total_margin || 0) < (prevData.total_margin || 0) * 0.95 ? 'MEDIUM' : 'LOW',
              insight_summary: (monthData.total_margin || 0) > (prevData.total_margin || 0) * 1.1 ? 
                              'Strong margin growth vs previous month' : 
                              (monthData.total_margin || 0) < (prevData.total_margin || 0) * 0.9 ? 
                              'Significant margin decline vs previous month' : 
                              'Margin relatively stable vs previous month'
            },
            {
              metric_category: 'Customer Metrics',
              metric_name: `${getMonthName(month)} ${year} Active Customers`,
              metric_value: activeCustomers,
              metric_unit: 'count',
              comparison_value: prevActiveCustomers,
              comparison_period: 'Previous Month',
              trend_direction: activeCustomers > prevActiveCustomers ? 'UP' : 
                              activeCustomers < prevActiveCustomers ? 'DOWN' : 'STABLE',
              alert_level: activeCustomers < prevActiveCustomers * 0.9 ? 'HIGH' : 
                          activeCustomers < prevActiveCustomers * 0.95 ? 'MEDIUM' : 'LOW',
              insight_summary: activeCustomers > prevActiveCustomers * 1.1 ? 
                              'Customer base growing significantly' : 
                              activeCustomers < prevActiveCustomers * 0.9 ? 
                              'Customer base declining - attention needed' : 
                              'Customer base relatively stable'
            },
            {
              metric_category: 'Churn Metrics',
              metric_name: `${getMonthName(month)} ${year} Customers at Risk`,
              metric_value: atRiskCustomers,
              metric_unit: 'count',
              comparison_value: prevAtRiskCustomers,
              comparison_period: 'Previous Month',
              trend_direction: atRiskCustomers > prevAtRiskCustomers ? 'UP' : 
                              atRiskCustomers < prevAtRiskCustomers ? 'DOWN' : 'STABLE',
              alert_level: atRiskCustomers > prevAtRiskCustomers * 1.1 ? 'HIGH' : 
                          atRiskCustomers > prevAtRiskCustomers ? 'MEDIUM' : 'LOW',
              insight_summary: atRiskCustomers > prevAtRiskCustomers * 1.2 ? 
                              'Significant increase in at-risk customers' : 
                              atRiskCustomers < prevAtRiskCustomers * 0.8 ? 
                              'Customer retention improving' : 
                              'Customer risk levels stable'
            },
            {
              metric_category: 'Order Metrics',
              metric_name: `${getMonthName(month)} ${year} Average Order Value`,
              metric_value: avgOrderValue,
              metric_unit: 'currency',
              comparison_value: prevAvgOrderValue,
              comparison_period: 'Previous Month',
              trend_direction: avgOrderValue > prevAvgOrderValue ? 'UP' : 
                              avgOrderValue < prevAvgOrderValue ? 'DOWN' : 'STABLE',
              alert_level: avgOrderValue < prevAvgOrderValue * 0.9 ? 'HIGH' : 
                          avgOrderValue < prevAvgOrderValue * 0.95 ? 'MEDIUM' : 'LOW',
              insight_summary: avgOrderValue > prevAvgOrderValue * 1.1 ? 
                              'Average order value increasing' : 
                              avgOrderValue < prevAvgOrderValue * 0.9 ? 
                              'Average order value declining' : 
                              'Average order value stable'
            }
          ];
          
          return executiveSummaryData;
        } else {
          // Regular weekly analysis
          const { data, error } = await supabase.rpc('get_sales_executive_summary', {
            p_year: year || new Date().getFullYear(),
            p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
            p_salesperson_code: effectiveSalesperson || null
          });

          if (error) {
            console.error('Error fetching executive summary:', error);
            return [];
          }

          return data || [];
        }
      } catch (err) {
        console.error('Unexpected error in executive summary:', err);
        return [];
      }
    },
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Helper function to get month name
function getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month - 1] || 'Unknown';
}

// Hook for data validation
export const useDataValidation = (year: number, week: number) => {
  return useQuery({
    queryKey: ['data-validation', year, week],
    queryFn: async (): Promise<DataValidation[]> => {
      try {
        // Try the main function first
        const { data, error } = await supabase.rpc('validate_sales_analytics_data', {
          p_year: year || new Date().getFullYear(),
          p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
        });

        if (error) {
          console.error('Error fetching data validation:', error);
          // Try the fallback function
          const fallbackResult = await supabase.rpc('validate_sales_analytics_data_fallback', {
            p_year: year || new Date().getFullYear(),
            p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
          });
          
          if (fallbackResult.error) {
            console.error('Error fetching fallback data validation:', fallbackResult.error);
            return [];
          }
          
          return fallbackResult.data || [];
        }

        return data || [];
      } catch (err) {
        console.error('Unexpected error in data validation:', err);
        return [];
      }
    },
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for refreshing analytics
export const useRefreshAnalytics = () => {
  const queryClient = useQueryClient();

  const refreshAnalytics = async (year: number, week: number) => {
    try {
      const { data, error } = await supabase.rpc('refresh_sales_analytics_for_period', {
        p_year: year || new Date().getFullYear(),
        p_week: week || Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
      });

      if (error) {
        console.error('Error refreshing analytics:', error);
        // Don't throw, just log the error
        return null;
      }

      // Invalidate all related queries
      await queryClient.invalidateQueries({
        queryKey: ['customer-churn-analysis', year, week]
      });
      await queryClient.invalidateQueries({
        queryKey: ['new-customer-analysis', year, week]
      });
      await queryClient.invalidateQueries({
        queryKey: ['product-performance-analysis', year, week]
      });
      await queryClient.invalidateQueries({
        queryKey: ['salesperson-performance-analysis', year, week]
      });
      await queryClient.invalidateQueries({
        queryKey: ['predictive-churn-analysis', year, week]
      });
      await queryClient.invalidateQueries({
        queryKey: ['executive-summary', year, week]
      });
      await queryClient.invalidateQueries({
        queryKey: ['data-validation', year, week]
      });

      return data;
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      throw error;
    }
  };

  return {
    refreshAnalytics,
    isRefreshing: false // This could be enhanced with state management
  };
};

// Composite hook for all analytics data with optimized monthly support
export const useSalesAnalytics = (year: number, week: number, salespersonCode?: string, month?: number) => {
  const customerChurn = useCustomerChurnAnalysis(year, week, salespersonCode, month);
  const newCustomers = useNewCustomerAnalysis(year, week, salespersonCode, month);
  const productPerformance = useProductPerformanceAnalysis(year, week, salespersonCode, month);
  const salespersonPerformance = useSalespersonPerformanceAnalysis(year, week, salespersonCode, month);
  const predictiveChurn = usePredictiveChurnAnalysis(year, week, salespersonCode);
  const executiveSummary = useExecutiveSummary(year, week, salespersonCode, month);
  const dataValidation = useDataValidation(year, week);
  const { refreshAnalytics } = useRefreshAnalytics();

  const isLoading = customerChurn.isLoading || newCustomers.isLoading || productPerformance.isLoading || 
                   salespersonPerformance.isLoading || predictiveChurn.isLoading || executiveSummary.isLoading || 
                   dataValidation.isLoading;

  const isError = customerChurn.isError || newCustomers.isError || productPerformance.isError || 
                 salespersonPerformance.isError || predictiveChurn.isError || executiveSummary.isError || 
                 dataValidation.isError;

  const error = customerChurn.error || newCustomers.error || productPerformance.error || 
               salespersonPerformance.error || predictiveChurn.error || executiveSummary.error || 
               dataValidation.error;

  return {
    // Data
    customerChurn: customerChurn.data || [],
    newCustomers: newCustomers.data || [],
    productPerformance: productPerformance.data || [],
    salespersonPerformance: salespersonPerformance.data || [],
    predictiveChurn: predictiveChurn.data || [],
    executiveSummary: executiveSummary.data || [],
    dataValidation: dataValidation.data || [],
    
    // State
    isLoading,
    isError,
    error,
    
    // Actions
    refreshAnalytics: () => refreshAnalytics(year, week),
    
    // Individual query states for granular loading
    individualStates: {
      customerChurn: { isLoading: customerChurn.isLoading, isError: customerChurn.isError, error: customerChurn.error },
      newCustomers: { isLoading: newCustomers.isLoading, isError: newCustomers.isError, error: newCustomers.error },
      productPerformance: { isLoading: productPerformance.isLoading, isError: productPerformance.isError, error: productPerformance.error },
      salespersonPerformance: { isLoading: salespersonPerformance.isLoading, isError: salespersonPerformance.isError, error: salespersonPerformance.error },
      predictiveChurn: { isLoading: predictiveChurn.isLoading, isError: predictiveChurn.isError, error: predictiveChurn.error },
      executiveSummary: { isLoading: executiveSummary.isLoading, isError: executiveSummary.isError, error: executiveSummary.error },
      dataValidation: { isLoading: dataValidation.isLoading, isError: dataValidation.isError, error: dataValidation.error },
    }
  };
};