import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import { useWeeklyProgressData } from '@/hooks/useWeeklyProgressData';
import { useWeeklyTopCustomers } from '@/hooks/useWeeklyTopCustomers';
import { useWeeklyCustomerList } from '@/hooks/useWeeklyCustomerList';
import { WeeklyReportFilters } from '@/contexts/WeeklyReportContext';

export interface ConsolidatedWeeklyData {
  summary: ReturnType<typeof useWeeklyData>['summary'];
  progress: ReturnType<typeof useWeeklyProgressData>['data'];
  topCustomers: ReturnType<typeof useWeeklyTopCustomers>['data'];
  customerList: ReturnType<typeof useWeeklyCustomerList>['data'];
  isLoading: boolean;
  error: Error | null;
}

export function useWeeklyReportData(filters: WeeklyReportFilters): ConsolidatedWeeklyData {
  const { year, week, salesperson, includeCreditMemo, includeServices } = filters;

  // Use existing hooks but consolidate their states
  const summaryQuery = useWeeklyData(year, week, salesperson, includeCreditMemo, includeServices);
  const progressQuery = useWeeklyProgressData(year, week, salesperson, includeCreditMemo, includeServices);
  const topCustomersQuery = useWeeklyTopCustomers(year, week, salesperson, includeCreditMemo, includeServices);
  const customerListQuery = useWeeklyCustomerList(year, week, salesperson, includeCreditMemo, includeServices);

  // Consolidate loading states
  const isLoading = summaryQuery.isLoading || 
                   progressQuery.isLoading || 
                   topCustomersQuery.isLoading || 
                   customerListQuery.isLoading;

  // Consolidate error states - return first error found
  const error = summaryQuery.error || 
               progressQuery.error || 
               topCustomersQuery.error || 
               customerListQuery.error;

  return {
    summary: summaryQuery.summary,
    progress: progressQuery.data,
    topCustomers: topCustomersQuery.data,
    customerList: customerListQuery.data,
    isLoading,
    error,
  };
}