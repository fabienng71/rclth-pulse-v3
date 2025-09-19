
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useWeeklyProgressData } from '@/hooks/useWeeklyProgressData';

interface WeeklyProgressTableProps {
  year: number;
  week: number;
  selectedSalesperson: string;
  includeCreditMemo: boolean;
  includeServices: boolean;
}

export const WeeklyProgressTable: React.FC<WeeklyProgressTableProps> = ({
  year,
  week,
  selectedSalesperson,
  includeCreditMemo,
  includeServices,
}) => {
  const { data: progressData, isLoading, error } = useWeeklyProgressData(year, week, selectedSalesperson, includeCreditMemo, includeServices);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage}%`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Progress (Fiscal Year)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading weekly progress...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Progress (Fiscal Year)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading weekly progress data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progressData || progressData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Progress (Fiscal Year)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for the selected period.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Progress (Fiscal Year - Week 14 to {week})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Week</TableHead>
              <TableHead className="text-right">Current Year</TableHead>
              <TableHead className="text-right">Previous Year</TableHead>
              <TableHead className="text-right">Running Total ({year})</TableHead>
              <TableHead className="text-right">Running Total ({year - 1})</TableHead>
              <TableHead className="text-right w-24">Variance %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progressData.map((row) => {
              const isPositiveVariance = row.variance_percent >= 0;
              return (
                <TableRow key={row.week_number}>
                  <TableCell className="font-medium">W{row.week_number}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.current_year_turnover)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.previous_year_turnover)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.current_year_running_total)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(row.previous_year_running_total)}</TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      isPositiveVariance ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositiveVariance ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="font-medium">{formatPercentage(row.variance_percent)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
