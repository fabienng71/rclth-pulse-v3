
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { formatMonth } from '@/components/reports/monthly-data/formatUtil';
import { SimpleChannelData } from '@/hooks/useSimpleChannelData';

interface ChannelSalesChartProps {
  data: SimpleChannelData[];
  months: string[];
  isLoading: boolean;
  error: Error | null;
}

// Define colors for chart lines
const CHART_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', 
  '#0891b2', '#4338ca', '#d97706', '#059669', '#7e22ce'
];

const ChannelSalesChart = ({ data, months, isLoading, error }: ChannelSalesChartProps) => {
  const [visibleChannels, setVisibleChannels] = useState<Record<string, boolean>>({});
  
  // Initialize visible channels
  useMemo(() => {
    if (data) {
      const initialVisibility: Record<string, boolean> = {};
      // Only show top 5 channels by default if there are more than 5
      const showTop = data.length > 5 ? 5 : data.length;
      
      data.forEach((channel, index) => {
        initialVisibility[channel.channel] = index < showTop;
      });
      setVisibleChannels(initialVisibility);
    }
  }, [data]);
  
  // Format data for chart
  const chartData = useMemo(() => {
    if (!months || !data) return [];
    
    return months.map(month => {
      const monthData: Record<string, any> = {
        month: formatMonth(month),
      };
      
      data.forEach(channel => {
        monthData[channel.channel] = channel.months[month] || 0;
      });
      
      return monthData;
    });
  }, [data, months]);
  
  const toggleChannelVisibility = (channel: string) => {
    setVisibleChannels(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
  };
  
  if (isLoading) {
    return <Card className="p-6">Loading channel sales data for chart...</Card>;
  }
  
  if (error) {
    return <Card className="p-6 text-red-600">Error: {error.message}</Card>;
  }
  
  if (!data || data.length === 0 || !months || months.length === 0) {
    return <Card className="p-6">No channel sales data available for charting.</Card>;
  }
  
  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {data.map((channel, index) => (
          <button
            key={channel.channel}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              visibleChannels[channel.channel]
                ? `bg-${CHART_COLORS[index % CHART_COLORS.length].substring(1)} text-white`
                : 'bg-gray-200 text-gray-700'
            }`}
            style={
              visibleChannels[channel.channel]
                ? { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }
                : {}
            }
            onClick={() => toggleChannelVisibility(channel.channel)}
          >
            {channel.channel_name || channel.channel}
          </button>
        ))}
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              angle={-45} 
              textAnchor="end"
              height={70} 
              padding={{ left: 10, right: 10 }} 
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)} 
              width={80}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), ""]} 
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            {data.map((channel, index) => (
              visibleChannels[channel.channel] && (
                <Line
                  key={channel.channel}
                  type="monotone"
                  dataKey={channel.channel}
                  name={channel.channel_name || channel.channel}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ChannelSalesChart;
