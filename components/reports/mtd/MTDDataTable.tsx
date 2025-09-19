
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MTDDayData, MTDSummary } from '@/hooks/useMTDData';
import { MTDTableRow } from './MTDTableRow';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface MTDDataTableProps {
  data: MTDDayData[];
  summary: MTDSummary;
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  isLoading: boolean;
}

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const MTDDataTable: React.FC<MTDDataTableProps> = ({
  data,
  summary,
  selectedYear,
  selectedMonth,
  selectedSalesperson,
  isLoading,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatVariance = (variance: number) => {
    const formatted = Math.abs(variance).toFixed(1);
    return variance >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-primary';
    if (variance < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const salespersonInfo = selectedSalesperson === 'all' 
    ? ' (All Salespersons)' 
    : ` (${selectedSalesperson})`;

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle>
          Daily Sales Comparison - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}{salespersonInfo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading daily sales data...</div>
        ) : data.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No sales data found for the selected period. This could be because:
              <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                <li>There are no sales transactions for this month</li>
                <li>Your salesperson code is not properly configured</li>
                <li>You don't have permission to view data for the selected salesperson</li>
              </ul>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Day</th>
                  <th className="text-left p-3 font-medium">Weekday</th>
                  <th className="text-right p-3 font-medium">{selectedYear} Sales</th>
                  <th className="text-right p-3 font-medium">{selectedYear - 1} Sales</th>
                  <th className="text-right p-3 font-medium">Running Total {selectedYear}</th>
                  <th className="text-right p-3 font-medium">Running Total {selectedYear - 1}</th>
                  <th className="text-right p-3 font-medium">Variance %</th>
                </tr>
              </thead>
              <tbody>
                {data.map((day) => (
                  <MTDTableRow key={day.day_of_month} day={day} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 bg-gray-50 font-semibold">
                  <td className="p-3" colSpan={2}>Total</td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(summary.current_year_total)}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(summary.previous_year_total)}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(summary.current_year_total)}
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(summary.previous_year_total)}
                  </td>
                  <td className={`p-3 text-right font-medium ${getVarianceColor(summary.total_variance_percent)}`}>
                    {formatVariance(summary.total_variance_percent)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>• Weekend days are highlighted in gray</p>
          <p>• Holiday days are highlighted in yellow</p>
          <p>• Variance is calculated as: (Running Total Current Year - Running Total Previous Year) / Running Total Previous Year × 100</p>
        </div>
      </CardContent>
    </Card>
  );
};
