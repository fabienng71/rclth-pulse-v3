
import React from 'react';
import { TurnoverCard } from '@/components/dashboard/TurnoverCard';
import { MonthlyAverageTurnoverCard } from '@/components/dashboard/MonthlyAverageTurnoverCard';
import { LastSalesCard } from '@/components/dashboard/LastSalesCard';
import { SalespersonContributionCard } from '@/components/dashboard/SalespersonContributionCard';

interface DashboardMetricsProps {
  totalTurnover: number | undefined;
  isLoadingTotal: boolean;
  totalError: Error | null;
  fromDate: Date;
  toDate: Date;
  lastSalesDate: Date | null;
  isLoadingLastSales: boolean;
  lastSalesError: Error | null;
  totalCompanyTurnover: number | undefined;
  isLoadingCompanyTotal: boolean;
  companyTotalError: Error | null;
  salespersonCode: string;
  salespersonName: string;
}

export const DashboardMetrics = ({
  totalTurnover,
  isLoadingTotal,
  totalError,
  fromDate,
  toDate,
  lastSalesDate,
  isLoadingLastSales,
  lastSalesError,
  totalCompanyTurnover,
  isLoadingCompanyTotal,
  companyTotalError,
  salespersonCode,
  salespersonName
}: DashboardMetricsProps) => {
  const { isAdmin, profile } = useAuthStore();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <TurnoverCard 
        totalTurnover={totalTurnover}
        isLoading={isLoadingTotal}
        error={totalError}
        fromDate={fromDate}
        toDate={toDate}
      />
      
      <MonthlyAverageTurnoverCard
        totalTurnover={totalTurnover}
        isLoading={isLoadingTotal}
        error={totalError}
        fromDate={fromDate}
        toDate={toDate}
      />
      
      <LastSalesCard
        date={lastSalesDate}
        isLoading={isLoadingLastSales}
        error={lastSalesError}
      />
      
      <SalespersonContributionCard
        salespersonTurnover={totalTurnover}
        totalCompanyTurnover={isAdmin ? (salespersonCode === "all" ? totalTurnover : totalCompanyTurnover) : totalCompanyTurnover}
        salespersonName={isAdmin ? (salespersonCode === "all" ? "All Salespeople" : salespersonName) : profile?.spp_code || ''}
        isLoading={isLoadingTotal || isLoadingCompanyTotal}
        error={totalError || companyTotalError}
      />
    </div>
  );
};

// Add the missing import
import { useAuthStore } from '@/stores/authStore';
