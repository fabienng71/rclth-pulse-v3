import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Clock } from 'lucide-react';
import { MTDSummary } from '@/hooks/useMTDData';

interface MTDProjectionCardProps {
  summary: MTDSummary;
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  isLoading?: boolean;
}

export const MTDProjectionCard: React.FC<MTDProjectionCardProps> = ({
  summary,
  selectedYear,
  selectedMonth,
  selectedSalesperson,
  isLoading = false,
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate projection based on working days average
  const calculateProjection = () => {
    if (!summary) return 0;
    
    // Use the corrected daily average from summary and multiply by total working days
    return summary.current_year_avg_daily * summary.total_working_days;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const projection = calculateProjection();
  const projectionVariance = summary.target_amount && summary.target_amount > 0 
    ? ((projection - summary.target_amount) / summary.target_amount) * 100 
    : 0;

  if (isLoading) {
    return (
      <Card className="mb-6 bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="mb-6 bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available for projection</p>
        </CardContent>
      </Card>
    );
  }

  const salespersonInfo = selectedSalesperson === 'all' 
    ? ' (All Salespersons)' 
    : ` (${selectedSalesperson})`;

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <TrendingUp className="h-5 w-5" />
          Monthly Projection - {months[selectedMonth - 1]} {selectedYear}{salespersonInfo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Projection */}
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Projected Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(projection)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Based on current average
            </div>
          </div>

          {/* Target Comparison */}
          {summary.target_amount && summary.target_amount > 0 && (
            <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">vs Target</span>
              </div>
              <div className={`text-2xl font-bold ${projectionVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {projectionVariance >= 0 ? '+' : ''}{projectionVariance.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Target: {formatCurrency(summary.target_amount)}
              </div>
            </div>
          )}

          {/* Working Days Progress */}
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Progress</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {summary.working_days_passed}/{summary.total_working_days}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Working days ({((summary.working_days_passed / summary.total_working_days) * 100).toFixed(0)}%)
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-4 p-3 bg-blue-50/50 rounded border border-blue-100">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Projection Details:</p>
            <div className="space-y-1 text-blue-700">
              <p>• Current Daily Average: {formatCurrency(summary.current_year_avg_daily)}</p>
              <p>• Days Remaining: {summary.total_working_days - summary.working_days_passed}</p>
              {summary.target_amount && summary.target_amount > 0 && (
                <p>• Daily Target Needed: {formatCurrency((summary.target_amount - summary.current_year_total) / Math.max(1, summary.total_working_days - summary.working_days_passed))}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};