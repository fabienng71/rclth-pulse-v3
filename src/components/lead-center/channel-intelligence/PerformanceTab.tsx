import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { getChannelBadgeColor } from '@/utils/channelMapping';

interface ChannelMetrics {
  channel: string;
  channelName: string;
  leadsCount: number;
  avgScore: number;
  conversionRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
  category: string;
}

interface PerformanceTabProps {
  channelMetrics: ChannelMetrics[];
  chartData: Array<{
    channel: string;
    score: number;
    conversion: number;
    deals: number;
    value: number;
  }>;
  getPerformanceColor: (score: number) => string;
  formatCurrency: (value: number) => string;
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  channelMetrics,
  chartData,
  getPerformanceColor,
  formatCurrency
}) => {
  return (
    <div className="space-y-6">
      {/* Channel Performance Chart */}
      <div className="h-96">
        <h3 className="text-lg font-semibold mb-4">Channel AI Score vs Conversion Rate</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="score" fill="#8884d8" name="AI Score" />
            <Bar yAxisId="right" dataKey="conversion" fill="#82ca9d" name="Conversion %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Channel Metrics Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Channel Performance Details</h3>
        <div className="space-y-2">
          {channelMetrics.map((metric, index) => (
            <div key={metric.channel} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className={getChannelBadgeColor(metric.category)}>
                      {metric.channel}
                    </Badge>
                    <span className="font-medium">{metric.channelName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.leadsCount} leads • {metric.conversionRate.toFixed(1)}% conversion
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${getPerformanceColor(metric.avgScore)}`}>
                  {Math.round(metric.avgScore)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(metric.avgDealSize)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};