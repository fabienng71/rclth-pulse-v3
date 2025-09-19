
import React, { useState } from 'react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Navigation from '@/components/Navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { WeeklyDataDisplay } from '@/components/dashboard/WeeklyDataDisplay';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useTurnoverData } from '@/hooks/dashboard/useTurnoverData';

const Dashboard = () => {
  console.log('=== LOADING ORIGINAL DASHBOARD (NOT ENHANCED) ===');
  const { user, profile, isAdmin } = useAuthStore();
  const [fromDate, setFromDate] = useState<Date>(startOfMonth(subMonths(new Date(), 6)));
  const [toDate, setToDate] = useState<Date>(endOfMonth(new Date()));
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');

  // Use the existing useTurnoverData hook
  const {
    totalTurnover,
    isLoadingTotal,
    totalError,
    monthlyTurnover,
    isLoadingMonthly,
    monthlyError,
    lastTransactionDate,
    isLoadingLastTransaction,
    lastTransactionError,
    totalCompanyTurnover,
    isLoadingCompanyTotal,
    companyTotalError,
    lastSalesDate,
    isLoadingLastSales,
    lastSalesError,
    lastCreditMemoDate,
    isLoadingLastCreditMemo,
    lastCreditMemoError
  } = useTurnoverData(fromDate, toDate, selectedSalesperson !== 'all' ? selectedSalesperson : undefined);

  // Get salesperson name for display
  const getSalespersonName = (code: string) => {
    if (code === 'all') return 'All Salespeople';
    // You could fetch salesperson names from a lookup table if needed
    return code;
  };

  return (
    <div className="app-background min-h-screen">
      <Navigation />
      <div className="section-background m-4 rounded-lg border border-border/30">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* ORIGINAL DASHBOARD INDICATOR */}
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Original Dashboard</strong>
            <span className="block sm:inline"> - You are viewing the OLD dashboard without credit memo integration</span>
          </div>
          
          <DashboardHeader />
          
          <Card variant="enhanced" className="p-6">
            <DashboardFilters
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              salespersonCode={selectedSalesperson}
              onSalespersonChange={setSelectedSalesperson}
            />
          </Card>

          <DashboardMetrics
            totalTurnover={totalTurnover}
            isLoadingTotal={isLoadingTotal}
            totalError={totalError}
            fromDate={fromDate}
            toDate={toDate}
            lastSalesDate={lastSalesDate}
            isLoadingLastSales={isLoadingLastSales}
            lastSalesError={lastSalesError}
            lastCreditMemoDate={lastCreditMemoDate}
            isLoadingLastCreditMemo={isLoadingLastCreditMemo}
            lastCreditMemoError={lastCreditMemoError}
            totalCompanyTurnover={totalCompanyTurnover}
            isLoadingCompanyTotal={isLoadingCompanyTotal}
            companyTotalError={companyTotalError}
            salespersonCode={selectedSalesperson}
            salespersonName={getSalespersonName(selectedSalesperson)}
          />

          <DashboardCharts
            monthlyTurnover={monthlyTurnover}
            isLoadingMonthly={isLoadingMonthly}
            monthlyError={monthlyError}
            salespersonCode={selectedSalesperson !== 'all' ? selectedSalesperson : undefined}
          />

          <Card variant="enhanced" className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Weekly Insights</h2>
            <WeeklyDataDisplay 
              salespersonCode={selectedSalesperson !== 'all' ? selectedSalesperson : undefined} 
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
