import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { useWeeklyReportFilters } from '@/contexts/WeeklyReportContext';
import { useWeeklyReportData } from '@/hooks/useWeeklyReportData';

export const WeeklySummary: React.FC = () => {
  const { filters } = useWeeklyReportFilters();
  const { summary, isLoading } = useWeeklyReportData(filters);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted/20 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted/20 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No data available
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPositiveVariance = summary.variance_percent >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filters.includeCreditMemo ? "Current Week Gross Turnover" : "Current Week Net Turnover"}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.current_week_turnover)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.week_start.toLocaleDateString()} - {summary.week_end.toLocaleDateString()}
          </p>
          {filters.includeServices && (
            <p className="text-xs text-blue-600 mt-1">Including service transactions</p>
          )}
          {filters.includeCreditMemo ? (
            <p className="text-xs text-orange-600 mt-1">Gross turnover (before credit memo deduction)</p>
          ) : (
            <p className="text-xs text-green-600 mt-1">Net turnover (after credit memo deduction)</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filters.includeCreditMemo ? "Previous Year Gross Turnover" : "Previous Year Net Turnover"}
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.previous_year_week_turnover)}</div>
          <p className="text-xs text-muted-foreground">
            Year-over-year comparison
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Week-over-Week Variance</CardTitle>
          {isPositiveVariance ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositiveVariance ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(summary.variance_percent)}
          </div>
          <p className="text-xs text-muted-foreground">
            vs. same week last year
          </p>
        </CardContent>
      </Card>
    </div>
  );
};