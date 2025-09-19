
import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { VendorSalesData } from '@/hooks/useVendorSalesData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface VendorSalesChartProps {
  data: VendorSalesData[];
  months: string[];
  isLoading: boolean;
}

export const VendorSalesChart = ({ data, months, isLoading }: VendorSalesChartProps) => {
  // Define colors for the pie chart
  const colors = [
    '#9b87f5', // primary purple
    '#7E69AB', // secondary purple
    '#6E59A5', // tertiary purple
    '#8B5CF6', // vivid purple
    '#D946EF', // magenta pink
    '#F97316', // bright orange
    '#10b981', // green
    '#0ea5e9', // sky blue
    '#f59e0b', // amber
    '#888888', // gray for "Others"
  ];

  const pieData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Calculate total sales across all months for each vendor
    const vendorsWithSales = data
      .map(vendor => ({
        name: vendor.vendor_name,
        code: vendor.vendor_code,
        value: vendor.total
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Take top 9 vendors and group the rest as "Others"
    const TOP_VENDORS_COUNT = 9;
    
    if (vendorsWithSales.length <= TOP_VENDORS_COUNT) {
      return vendorsWithSales;
    }
    
    const topVendors = vendorsWithSales.slice(0, TOP_VENDORS_COUNT);
    const otherVendors = vendorsWithSales.slice(TOP_VENDORS_COUNT);
    
    const othersTotal = otherVendors.reduce((total, vendor) => total + vendor.value, 0);
    
    if (othersTotal > 0) {
      return [
        ...topVendors,
        {
          name: 'Others',
          code: 'others',
          value: othersTotal
        }
      ];
    }
    
    return topVendors;
  }, [data]);

  const totalValue = useMemo(() => {
    return pieData.reduce((sum, item) => sum + item.value, 0);
  }, [pieData]);

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading chart data...</div>;
  }
  
  if (data.length === 0) {
    return <div className="flex justify-center p-6">No vendor data available for the selected period.</div>;
  }

  // Custom tooltip component for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalValue) * 100).toFixed(1);
      
      return (
        <div className="bg-background border border-border p-3 shadow-md rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{`${percentage}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend for better layout
  const CustomLegendContent = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-sm">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-item-${index}`} className="flex items-center gap-1 overflow-hidden">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Custom label renderer for the pie slices
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    
    // Only show labels for segments that make up at least 5% of the pie
    if (percent < 0.05) return null;
    
    // Calculate positioning with a slight adjustment to prevent truncation
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Distribution</CardTitle>
        <CardDescription>Sales distribution by vendor for the selected date range</CardDescription>
      </CardHeader>
      <CardContent>
        {pieData.length > 0 ? (
          <>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius="85%"
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={renderCustomizedLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    content={<CustomLegendContent />}
                    layout="horizontal"
                    verticalAlign="bottom"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Display detailed data table for better clarity */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Vendor</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                    <th className="text-right py-2 font-medium">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {pieData.map((item, i) => {
                    const percentage = ((item.value / totalValue) * 100).toFixed(1);
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-2 flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-sm" 
                            style={{ backgroundColor: colors[i % colors.length] }}
                          />
                          {item.name}
                        </td>
                        <td className="py-2 text-right">{formatCurrency(item.value)}</td>
                        <td className="py-2 text-right">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-[350px] text-muted-foreground">
            No data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};
