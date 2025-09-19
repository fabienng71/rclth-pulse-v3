
import React from 'react';
import { MonthlyTurnoverTable } from './MonthlyTurnoverTable';

interface DashboardChartsProps {
  monthlyTurnover: any[] | undefined;
  isLoadingMonthly: boolean;
  monthlyError: Error | null;
  salespersonCode?: string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  monthlyTurnover, 
  isLoadingMonthly, 
  monthlyError,
  salespersonCode 
}) => {
  return (
    <div className="w-full">
      {/* Monthly Turnover Table */}
      <MonthlyTurnoverTable 
        monthlyTurnover={monthlyTurnover}
        isLoading={isLoadingMonthly}
        error={monthlyError}
      />
    </div>
  );
};
