
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import { MonthlyItemData } from '@/types/sales';
import { differenceInMonths, parseISO, startOfMonth, endOfMonth } from 'date-fns';

interface ItemSalesSummaryProps {
  monthlyData: MonthlyItemData[];
  showAmount: boolean;
  isLoading: boolean;
}

export const ItemSalesSummary: React.FC<ItemSalesSummaryProps> = ({
  monthlyData,
  showAmount,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-16">
            <CardContent className="p-3">
              <div className="animate-pulse">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate metrics with proper date-based calculations
  const totalValue = monthlyData.reduce((sum, month) => 
    sum + (showAmount ? month.totals.amount : month.totals.quantity), 0
  );

  // Get all available months and sort them
  const allMonths = monthlyData.length > 0 
    ? Object.keys(monthlyData[0].month_data).sort()
    : [];

  // Find current (latest) month and previous month from available data
  const currentMonthKey = allMonths[allMonths.length - 1];
  const previousMonthKey = allMonths[allMonths.length - 2];

  // Calculate current month value from the latest available month
  const currentMonthValue = currentMonthKey 
    ? monthlyData.reduce((sum, item) => {
        const monthData = item.month_data[currentMonthKey];
        return sum + (monthData ? (showAmount ? monthData.amount : monthData.quantity) : 0);
      }, 0)
    : 0;

  // Calculate previous month value
  const previousMonthValue = previousMonthKey 
    ? monthlyData.reduce((sum, item) => {
        const monthData = item.month_data[previousMonthKey];
        return sum + (monthData ? (showAmount ? monthData.amount : monthData.quantity) : 0);
      }, 0)
    : 0;

  // Calculate monthly growth as percentage change from previous to current month
  const monthlyGrowth = previousMonthValue > 0 
    ? ((currentMonthValue - previousMonthValue) / previousMonthValue) * 100 
    : currentMonthValue > 0 ? 100 : 0;

  // Calculate monthly average based on the number of months with data
  const monthsWithData = allMonths.length;
  const averageMonthly = monthsWithData > 0 ? totalValue / monthsWithData : 0;

  const formatValue = (value: number) => {
    if (showAmount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  const metrics = [
    {
      title: `Total ${showAmount ? 'Sales' : 'Quantity'}`,
      value: formatValue(totalValue),
      icon: BarChart3,
      color: 'text-blue-600'
    },
    {
      title: `Current Month`,
      value: formatValue(currentMonthValue),
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      title: 'Monthly Growth',
      value: `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`,
      icon: monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      color: monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Monthly Average',
      value: formatValue(averageMonthly),
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
      {metrics.map((metric, index) => (
        <Card key={index} className="h-16">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {metric.title}
                </p>
                <p className="text-sm font-bold">
                  {metric.value}
                </p>
              </div>
              <metric.icon className={`h-4 w-4 ${metric.color} flex-shrink-0 ml-2`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
