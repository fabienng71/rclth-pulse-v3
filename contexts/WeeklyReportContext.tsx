import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWeekData } from '@/hooks/useWeekData';

export interface WeeklyReportFilters {
  year: number;
  week: number;
  salesperson: string;
  includeCreditMemo: boolean;
  includeServices: boolean;
}

interface WeeklyReportContextType {
  filters: WeeklyReportFilters;
  setYear: (year: number) => void;
  setWeek: (week: number) => void;
  setSalesperson: (salesperson: string) => void;
  setIncludeCreditMemo: (include: boolean) => void;
  setIncludeServices: (include: boolean) => void;
  isLoading: boolean;
}

const WeeklyReportContext = createContext<WeeklyReportContextType | undefined>(undefined);

export function useWeeklyReportFilters() {
  const context = useContext(WeeklyReportContext);
  if (!context) {
    throw new Error('useWeeklyReportFilters must be used within WeeklyReportProvider');
  }
  return context;
}

interface WeeklyReportProviderProps {
  children: ReactNode;
}

export function WeeklyReportProvider({ children }: WeeklyReportProviderProps) {
  const queryClient = useQueryClient();
  const { currentWeek: defaultWeek, currentYear: defaultYear, isLoading: weekDataLoading } = useWeekData();

  const [filters, setFilters] = useState<WeeklyReportFilters>({
    year: defaultYear,
    week: defaultWeek,
    salesperson: 'all',
    includeCreditMemo: true,
    includeServices: true,
  });

  // Update filters when default data loads
  useEffect(() => {
    if (!weekDataLoading && defaultWeek && defaultYear) {
      setFilters(prev => ({
        ...prev,
        year: defaultYear,
        week: defaultWeek,
      }));
    }
  }, [weekDataLoading, defaultWeek, defaultYear]);

  // Helper function to invalidate all weekly data
  const invalidateWeeklyData = () => {
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0] as string;
        return key?.includes('weekly');
      }
    });
  };

  const setYear = (year: number) => {
    setFilters(prev => ({ ...prev, year }));
    invalidateWeeklyData();
  };

  const setWeek = (week: number) => {
    setFilters(prev => ({ ...prev, week }));
    invalidateWeeklyData();
  };

  const setSalesperson = (salesperson: string) => {
    setFilters(prev => ({ ...prev, salesperson }));
    invalidateWeeklyData();
  };

  const setIncludeCreditMemo = (includeCreditMemo: boolean) => {
    setFilters(prev => ({ ...prev, includeCreditMemo }));
    invalidateWeeklyData();
  };

  const setIncludeServices = (includeServices: boolean) => {
    setFilters(prev => ({ ...prev, includeServices }));
    invalidateWeeklyData();
  };


  const value: WeeklyReportContextType = {
    filters,
    setYear,
    setWeek,
    setSalesperson,
    setIncludeCreditMemo,
    setIncludeServices,
    isLoading: weekDataLoading,
  };

  return (
    <WeeklyReportContext.Provider value={value}>
      {children}
    </WeeklyReportContext.Provider>
  );
}