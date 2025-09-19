import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Receipt } from 'lucide-react';
import { MonthlyReportSummary } from '@/hooks/useMonthlyReport';

interface MonthlyReportSummaryCardsProps {
  summary: MonthlyReportSummary;
  isLoading: boolean;
  selectedSalesperson?: string;
  includeCreditMemos: boolean;
}

export const MonthlyReportSummaryCards: React.FC<MonthlyReportSummaryCardsProps> = ({ 
  summary, 
  isLoading, 
  selectedSalesperson,
  includeCreditMemos 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  if (isLoading) {
    return null;
  }

  const salespersonLabel = selectedSalesperson && selectedSalesperson !== 'all' 
    ? ` (${selectedSalesperson})` 
    : selectedSalesperson === 'all' 
    ? ' (All Salespersons)' 
    : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            Total Customers{salespersonLabel}
          </div>
          <div className="text-2xl font-bold">{summary.total_customers}</div>
          <div className="text-sm text-muted-foreground">
            {summary.total_transactions} transactions
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            {includeCreditMemos ? 'Net Turnover' : 'Total Turnover'}
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(includeCreditMemos ? summary.net_turnover : summary.total_turnover)}
          </div>
          {includeCreditMemos && summary.total_credit_memos > 0 && (
            <div className="text-sm text-red-600">
              -{formatCurrency(summary.total_credit_memos)} credit memos
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            {includeCreditMemos ? 'Net Margin' : 'Total Margin'}
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(includeCreditMemos ? summary.net_margin : summary.total_margin)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatPercent(includeCreditMemos ? summary.net_margin_percent : summary.average_margin_percent)} margin
          </div>
        </CardContent>
      </Card>

      <Card className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Receipt className="h-4 w-4" />
            Average per Customer
          </div>
          <div className="text-lg font-bold">
            {summary.total_customers > 0 ? 
              formatCurrency((includeCreditMemos ? summary.net_turnover : summary.total_turnover) / summary.total_customers) :
              '0'
            }
          </div>
          <div className="text-sm text-muted-foreground">
            {summary.total_customers > 0 ? 
              (summary.total_transactions / summary.total_customers).toFixed(1) : 
              '0'
            } transactions avg
          </div>
        </CardContent>
      </Card>
    </div>
  );
};