
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, Target } from 'lucide-react';
import { YTDSummaryData } from '@/hooks/useShortBusinessReport';

interface YTDSummaryCardsProps {
  data?: YTDSummaryData;
  isLoading: boolean;
}

export const YTDSummaryCards: React.FC<YTDSummaryCardsProps> = ({ data, isLoading }) => {
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
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}
        {percentage}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No YTD summary data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Turnover */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            YTD Total Turnover
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.total_net_turnover)}</div>
          <div className="text-xs text-muted-foreground">
            Daily Average: {formatCurrency(data.ytd_net_daily_avg)}
          </div>
        </CardContent>
      </Card>

      {/* Gross Margin */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            YTD Gross Margin
          </CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.total_net_gross_margin)}</div>
          <div className="text-xs text-muted-foreground">
            Margin %: {data.total_net_turnover > 0 ? ((data.total_net_gross_margin / data.total_net_turnover) * 100).toFixed(1) : '0'}%
          </div>
        </CardContent>
      </Card>

      {/* Budget Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Budget vs Actual
          </CardTitle>
          {data.ytd_budget_vs_actual_percent && data.ytd_budget_vs_actual_percent >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.total_budget)}</div>
          <div className="text-xs">
            vs Budget: {formatPercentage(data.ytd_budget_vs_actual_percent)}
          </div>
        </CardContent>
      </Card>

      {/* YoY Growth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Year over Year
          </CardTitle>
          {data.ytd_yoy_percent && data.ytd_yoy_percent >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.total_prev_year)}</div>
          <div className="text-xs">
            Growth: {formatPercentage(data.ytd_yoy_percent)}
          </div>
        </CardContent>
      </Card>

      {/* Customers Served */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Customers Served
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_customers_served.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {data.total_working_days > 0 ? (data.total_customers_served / data.total_working_days).toFixed(1) : '0'} per day
          </div>
        </CardContent>
      </Card>

      {/* Invoices Issued */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Invoices Issued
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_invoices_issued.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            Avg Amount: {formatCurrency(data.ytd_avg_invoice_amount)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
