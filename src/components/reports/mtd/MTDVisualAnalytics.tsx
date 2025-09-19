import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MTDDayData, MTDSummary } from '@/hooks/useMTDData';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface MTDVisualAnalyticsProps {
  data: MTDDayData[];
  summary: MTDSummary;
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  isLoading?: boolean;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export const MTDVisualAnalytics: React.FC<MTDVisualAnalyticsProps> = ({
  data,
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

  const chartData = useMemo(() => {
    return data.map(day => ({
      day: day.day_of_month,
      dayLabel: `${day.day_of_month}`,
      weekday: day.weekday_name,
      currentYear: day.current_year_sales,
      previousYear: day.previous_year_sales,
      runningCurrentYear: day.running_total_current_year,
      runningPreviousYear: day.running_total_previous_year,
      variance: day.variance_percent,
      isWeekend: day.is_weekend,
      isHoliday: day.is_holiday,
    }));
  }, [data]);


  const summaryPieData = useMemo(() => {
    const remainingTarget = Math.max(0, (summary.target_amount || 0) - summary.current_year_total);
    
    return [
      { name: 'Achieved', value: summary.current_year_total, color: '#22c55e' },
      { name: 'Remaining', value: remainingTarget, color: '#e5e7eb' },
    ].filter(item => item.value > 0);
  }, [summary]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background-secondary p-3 border border-border/30 rounded shadow-medium transition-smooth">
          <p className="font-semibold">{`Day ${label} (${data.weekday})`}</p>
          {data.isWeekend && <p className="text-sm text-muted-foreground">Weekend</p>}
          {data.isHoliday && <p className="text-sm text-warning">Holiday</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.name.includes('%') ? formatPercent(entry.value) : formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="mb-6 bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visual Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading charts...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="mb-6 bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Visual Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available for visualization</p>
        </CardContent>
      </Card>
    );
  }

  const salespersonInfo = selectedSalesperson === 'all' 
    ? ' (All Salespersons)' 
    : ` (${selectedSalesperson})`;

  return (
    <Card className="mb-6 bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Visual Analytics - {months[selectedMonth - 1]} {selectedYear}{salespersonInfo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Sales Trends</TabsTrigger>
            <TabsTrigger value="running">Running Totals</TabsTrigger>
            <TabsTrigger value="target">Target Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Sales Amount', angle: -90, position: 'insideLeft' }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="currentYear" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name={`${selectedYear} Sales`}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="previousYear" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name={`${selectedYear - 1} Sales`}
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="running" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Cumulative Sales', angle: -90, position: 'insideLeft' }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="runningCurrentYear" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    name={`${selectedYear} Running Total`}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="runningPreviousYear" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    name={`${selectedYear - 1} Running Total`}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="target" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <h3 className="text-lg font-semibold mb-4 text-center">Target Achievement</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summaryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {summaryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Target Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Target Amount</span>
                    <span className="text-lg font-bold">{formatCurrency(summary.target_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Current Achievement</span>
                    <span className="text-lg font-bold">{formatCurrency(summary.current_year_total)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Achievement %</span>
                    <span className={`text-lg font-bold ${
                      (summary.target_achievement_percent || 0) >= 100 ? 'text-green-600' : 
                      (summary.target_achievement_percent || 0) >= 75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercent(summary.target_achievement_percent || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">Remaining</span>
                    <span className="text-lg font-bold">
                      {formatCurrency(Math.max(0, (summary.target_amount || 0) - summary.current_year_total))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};