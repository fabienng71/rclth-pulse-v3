
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { MarginOverallData, ViewMode } from '@/hooks/useMarginAnalysisData';

export interface MarginSummaryCardProps {
  data: MarginOverallData;
  year: number;
  month: number;
  viewMode: ViewMode;
}

export const MarginSummaryCard: React.FC<MarginSummaryCardProps> = ({ 
  data, 
  year, 
  month, 
  viewMode 
}) => {
  if (!data) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[month - 1];
  const isAdjusted = viewMode === 'adjusted' && data.adjusted_sales !== undefined;

  // Format margin percentage with appropriate color
  const getMarginClass = (percent: number) => {
    if (percent >= 25) return 'text-green-600';
    if (percent < 15) return 'text-red-500';
    return 'text-yellow-500';
  };

  // Use adjusted values if in adjusted mode and they exist
  const displayedSales = isAdjusted ? data.adjusted_sales : data.total_sales;
  const displayedMargin = isAdjusted ? data.adjusted_margin : data.margin;
  const displayedMarginPercent = isAdjusted ? data.adjusted_margin_percent : data.margin_percent;
  const marginClass = getMarginClass(displayedMarginPercent || 0);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Margin Summary: {monthName} {year}</h2>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">{formatCurrency(displayedSales || 0)}</p>
              {isAdjusted && data.total_credit_memos && (
                <p className="text-xs text-muted-foreground">
                  Original: {formatCurrency(data.total_sales || 0)}
                  <span className="text-red-500 ml-1">
                    (-{formatCurrency(data.total_credit_memos)})
                  </span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Cost of Goods</p>
              <p className="text-2xl font-bold">{formatCurrency(data.total_cost || 0)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Margin</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{formatCurrency(displayedMargin || 0)}</p>
                <p className={`text-lg font-bold ${marginClass}`}>
                  {displayedMarginPercent?.toFixed(2)}%
                </p>
              </div>
              {isAdjusted && (
                <p className="text-xs text-muted-foreground">
                  Original: {formatCurrency(data.margin || 0)}
                  <span className="ml-1">({data.margin_percent?.toFixed(2)}%)</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
