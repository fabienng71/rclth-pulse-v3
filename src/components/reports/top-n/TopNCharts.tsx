import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ProcessedTopNData } from '@/hooks/useTopNCustomersData';
import { formatCurrency } from '@/utils/formatters';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface TopNChartsProps {
  data: ProcessedTopNData;
  topN: number;
}

// Color palette for charts
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
  '#0000ff',
  '#ff00ff',
  '#00ffff',
  '#ffff00',
  '#ff0080',
];

export const TopNCharts: React.FC<TopNChartsProps> = ({ data, topN }) => {
  // Format month string for display
  const formatMonth = (month: string) => {
    try {
      const date = new Date(month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } catch {
      return month;
    }
  };

  // Chart configuration
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.customers.slice(0, 10).forEach((customer, index) => {
      config[customer.customer_code] = {
        label: customer.search_name || customer.customer_name,
        color: COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [data.customers]);

  // Data for customer ranking bar chart
  const customerRankingData = useMemo(() => {
    return data.customers.slice(0, topN).map((customer, index) => ({
      rank: index + 1,
      name: customer.search_name || customer.customer_name,
      shortName: (customer.search_name || customer.customer_name).substring(0, 15) + '...',
      total_turnover: customer.total_turnover,
      customer_code: customer.customer_code,
    }));
  }, [data.customers, topN]);

  // Data for monthly trend line chart
  const monthlyTrendData = useMemo(() => {
    return data.months.map(month => {
      const monthData: any = {
        month: formatMonth(month),
        fullMonth: month,
        total: data.monthlyTotals[month] || 0,
      };
      
      // Add top 10 customers' data for this month
      data.customers.slice(0, 10).forEach(customer => {
        monthData[customer.customer_code] = customer.monthly_data[month] || 0;
      });
      
      return monthData;
    });
  }, [data.months, data.monthlyTotals, data.customers]);

  // Data for customer distribution pie chart
  const customerDistributionData = useMemo(() => {
    const topCustomers = data.customers.slice(0, 8);
    const othersTotal = data.customers.slice(8).reduce((sum, customer) => sum + customer.total_turnover, 0);
    
    const pieData = topCustomers.map(customer => ({
      name: customer.search_name || customer.customer_name,
      value: customer.total_turnover,
      customer_code: customer.customer_code,
    }));
    
    if (othersTotal > 0) {
      pieData.push({
        name: 'Others',
        value: othersTotal,
        customer_code: 'others',
      });
    }
    
    return pieData;
  }, [data.customers]);

  // Data for monthly area chart (cumulative view)
  const monthlyAreaData = useMemo(() => {
    return data.months.map(month => ({
      month: formatMonth(month),
      total: data.monthlyTotals[month] || 0,
      cumulative: data.months.slice(0, data.months.indexOf(month) + 1)
        .reduce((sum, m) => sum + (data.monthlyTotals[m] || 0), 0),
    }));
  }, [data.months, data.monthlyTotals]);

  if (!data.customers.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No data available for charts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Top N Customer Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ranking">Customer Ranking</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ranking" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Top {topN} customers by total turnover
            </div>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={customerRankingData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="shortName" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    fontSize={12}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: string, props: any) => [
                      formatCurrency(Number(value)),
                      props.payload?.name || name
                    ]}
                  />
                  <Bar 
                    dataKey="total_turnover" 
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              Monthly performance trends for top 10 customers
            </div>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    fontSize={12}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: string) => [
                      formatCurrency(Number(value)),
                      chartConfig[name]?.label || name
                    ]}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  
                  {/* Total line */}
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--foreground))"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Total"
                    connectNulls={false}
                  />
                  
                  {/* Top 5 customer lines */}
                  {data.customers.slice(0, 5).map((customer, index) => (
                    <Line
                      key={customer.customer_code}
                      type="monotone"
                      dataKey={customer.customer_code}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PieChartIcon className="h-4 w-4" />
              Customer turnover distribution
            </div>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <Pie
                    data={customerDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: string) => [
                      formatCurrency(Number(value)),
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="cumulative" className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Monthly and cumulative turnover progression
            </div>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyAreaData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    fontSize={12}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: any, name: string) => [
                      formatCurrency(Number(value)),
                      name === 'total' ? 'Monthly Total' : 'Cumulative Total'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stackId="1"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stackId="2"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};