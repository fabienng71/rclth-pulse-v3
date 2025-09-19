
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerMonthlyTurnover } from '@/hooks/useCustomerTurnoverData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { eachMonthOfInterval, format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

interface CustomerTurnoverChartProps {
  data: CustomerMonthlyTurnover[];
  isLoading: boolean;
  fromDate?: Date;
  toDate?: Date;
}

export const CustomerTurnoverChart: React.FC<CustomerTurnoverChartProps> = ({ 
  data, 
  isLoading,
  fromDate,
  toDate
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Monthly Turnover</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get unique customers
  const allCustomers = Array.from(
    new Set(data.map(item => item.customer_code))
  ).map(code => {
    const customerData = data.find(item => item.customer_code === code);
    return {
      code,
      name: customerData?.search_name || customerData?.customer_name || code
    };
  });

  // Get all months in the date range, not just those with data
  const currentFromDate = fromDate || (data.length > 0 ? 
    parse(data.reduce((min, item) => item.year_month < min ? item.year_month : min, data[0].year_month), 'yyyy-MM', new Date()) : 
    new Date());
    
  const currentToDate = toDate || (data.length > 0 ? 
    parse(data.reduce((max, item) => item.year_month > max ? item.year_month : max, data[0].year_month), 'yyyy-MM', new Date()) : 
    new Date());

  // Generate all months in the range
  const allMonthsInRange = eachMonthOfInterval({
    start: startOfMonth(currentFromDate),
    end: endOfMonth(currentToDate)
  }).map(date => format(date, 'yyyy-MM'));

  // Create chart data with consistent months
  const chartData = allMonthsInRange.map(month => {
    const monthData: Record<string, any> = {
      month: format(parse(month, 'yyyy-MM', new Date()), 'MMM yyyy')
    };

    // Add data for each customer
    allCustomers.forEach(customer => {
      const customerMonthData = data.find(
        item => item.customer_code === customer.code && item.year_month === month
      );
      monthData[customer.code] = customerMonthData?.total_amount || 0;
      // Store customer name for use in tooltip
      monthData[`${customer.code}_name`] = customer.name;
    });

    return monthData;
  });

  // Calculate customer totals to filter out customers with zero turnover
  const customerTotals: Record<string, number> = {};
  allCustomers.forEach(customer => {
    customerTotals[customer.code] = chartData.reduce((sum, month) => {
      return sum + (month[customer.code] || 0);
    }, 0);
  });

  // Filter out customers with zero turnover
  const uniqueCustomers = allCustomers.filter(customer => customerTotals[customer.code] > 0);
  
  // Count hidden customers
  const hiddenCustomersCount = allCustomers.length - uniqueCustomers.length;

  // Generate colors for lines with better contrast for visibility
  const colors = [
    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#ec4899', '#6366f1', '#0ea5e9', '#14b8a6'
  ];

  // Enhanced custom tooltip to show proper customer names and values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-md shadow">
          <p className="font-medium">{label}</p>
          <div className="mt-2">
            {payload.map((entry: any, index: number) => {
              // Get the original customer name from the data
              const customerCode = entry.dataKey;
              const customerName = chartData.find(item => item.month === label)?.[`${customerCode}_name`] || customerCode;
              
              return (
                <div key={index} className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span>{customerName}:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', { 
                      maximumFractionDigits: 0
                    }).format(entry.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Monthly Turnover</CardTitle>
      </CardHeader>
      <CardContent>
        {hiddenCustomersCount > 0 && (
          <div className="mb-4 text-sm flex items-center text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            <span>
              {hiddenCustomersCount} {hiddenCustomersCount === 1 ? 'customer' : 'customers'} with no turnover {hiddenCustomersCount === 1 ? 'is' : 'are'} hidden from the chart
            </span>
          </div>
        )}
        
        {chartData.length > 0 && uniqueCustomers.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('en-US', {
                      notation: 'compact',
                      compactDisplay: 'short'
                    }).format(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                {uniqueCustomers.map((customer, index) => (
                  <Line
                    key={customer.code}
                    type="monotone"
                    dataKey={customer.code}
                    name={customer.name}
                    stroke={colors[index % colors.length]}
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    dot={{ stroke: colors[index % colors.length], strokeWidth: 2, r: 4, fill: 'white' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No turnover data available for the selected customers and time period.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
