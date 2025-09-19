
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MonthlyReportData } from '@/hooks/useShortBusinessReport';

interface ShortBusinessReportTableProps {
  data: MonthlyReportData[];
  isLoading: boolean;
  fiscalYear: number;
}

export const ShortBusinessReportTable: React.FC<ShortBusinessReportTableProps> = ({
  data,
  isLoading,
  fiscalYear,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number | null) => {
    if (percentage === null) return 'N/A';
    const isPositive = percentage > 0;
    // CORRECTED LOGIC: Positive = good (green), Negative = bad (red)
    return (
      <span className={isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
        {isPositive ? '+' : ''}
        {percentage.toFixed(2)}%
      </span>
    );
  };

  const getMonthName = (monthNum: number) => {
    return new Date(2024, monthNum - 1).toLocaleString('default', { month: 'short' });
  };

  // Calculate totals for past/current months only
  const calculateTotals = () => {
    const pastCurrentData = data.filter(month => month.is_past_or_current_month);
    
    const totals = {
      net_turnover: pastCurrentData.reduce((sum, month) => sum + month.net_turnover, 0),
      net_gross_margin: pastCurrentData.reduce((sum, month) => sum + month.net_gross_margin, 0),
      budget: pastCurrentData.reduce((sum, month) => sum + month.budget, 0),
      prev_year_turnover: pastCurrentData.reduce((sum, month) => sum + month.prev_year_turnover, 0),
      customers_served: pastCurrentData.reduce((sum, month) => sum + month.customers_served, 0),
      invoices_issued: pastCurrentData.reduce((sum, month) => sum + month.invoices_issued, 0),
      working_days: pastCurrentData.reduce((sum, month) => sum + month.working_days, 0),
    };

    // Calculate derived totals
    const daily_avg = totals.working_days > 0 ? totals.net_turnover / totals.working_days : 0;
    const avg_invoice = totals.invoices_issued > 0 ? totals.net_turnover / totals.invoices_issued : 0;
    
    // Calculate overall budget vs actual percentage
    const budget_vs_actual_percent = totals.budget > 0 
      ? ((totals.net_turnover - totals.budget) / totals.budget) * 100 
      : null;
    
    // Calculate overall YoY percentage
    const yoy_percent = totals.prev_year_turnover > 0 
      ? ((totals.net_turnover - totals.prev_year_turnover) / totals.prev_year_turnover) * 100 
      : null;

    return {
      ...totals,
      daily_avg,
      avg_invoice,
      budget_vs_actual_percent,
      yoy_percent,
    };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Business Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading report data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Business Performance - FY {fiscalYear}-{fiscalYear + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Month</TableHead>
                <TableHead className="text-right">Turnover</TableHead>
                <TableHead className="text-right">Gross Margin</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Budget vs Actual</TableHead>
                <TableHead className="text-right">Prev Year</TableHead>
                <TableHead className="text-right">YoY</TableHead>
                <TableHead className="text-right">Daily Avg</TableHead>
                <TableHead className="text-right">Customers</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Avg Invoice</TableHead>
                <TableHead className="text-right">Work Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((month) => (
                <TableRow key={month.month_num} className={!month.is_past_or_current_month ? 'opacity-60 bg-muted/20' : ''}>
                  <TableCell className="font-medium">
                    {getMonthName(month.month_num)}
                    {!month.is_past_or_current_month && (
                      <span className="ml-1 text-xs text-muted-foreground">(Future)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(month.net_turnover)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(month.net_gross_margin)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(month.budget)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(month.budget_vs_actual_percent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(month.prev_year_turnover)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(month.yoy_percent)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(month.net_daily_avg)}
                  </TableCell>
                  <TableCell className="text-right">
                    {month.customers_served.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {month.invoices_issued.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(month.net_avg_invoice_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {month.working_days}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Totals Row */}
              <TableRow className="border-t-2 border-border bg-muted/30 font-semibold">
                <TableCell className="font-bold">
                  TOTAL
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.net_turnover)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.net_gross_margin)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.budget)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatPercentage(totals.budget_vs_actual_percent)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.prev_year_turnover)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatPercentage(totals.yoy_percent)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.daily_avg)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totals.customers_served.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totals.invoices_issued.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.avg_invoice)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {totals.working_days}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
