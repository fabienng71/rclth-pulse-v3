
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { ProcessedTopNData } from '@/hooks/useTopNCustomersData';
import { formatCurrency } from '@/utils/formatters';

interface TopNSummaryCardsProps {
  data: ProcessedTopNData;
  topN: number;
}

export const TopNSummaryCards: React.FC<TopNSummaryCardsProps> = ({ data, topN }) => {
  const averageMonthlyTurnover = data.months.length > 0 
    ? data.grandTotal / data.months.length 
    : 0;
    
  const topCustomerTurnover = data.customers.length > 0 
    ? data.customers[0].total_turnover 
    : 0;

  const averageMarginPercent = data.grandTotal > 0 
    ? (data.grandMarginTotal / data.grandTotal) * 100 
    : 0;
    
  const topCustomerMargin = data.customers.length > 0 
    ? data.customers[0].total_margin 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.customers.length}</div>
          <p className="text-xs text-muted-foreground">
            Top {topN} customers analyzed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Turnover</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(data.grandTotal)}</div>
          <p className="text-xs text-muted-foreground">
            Combined turnover
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Monthly</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageMonthlyTurnover)}</div>
          <p className="text-xs text-muted-foreground">
            Average per month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Customer</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(topCustomerTurnover)}</div>
          <p className="text-xs text-muted-foreground">
            Highest turnover
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Margin</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(data.grandMarginTotal)}</div>
          <p className="text-xs text-muted-foreground">
            Combined margin
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Margin %</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{averageMarginPercent.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Overall profitability
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
