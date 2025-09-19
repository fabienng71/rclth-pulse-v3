import React from 'react';
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TrendsTabProps {
  chartData: Array<{
    channel: string;
    score: number;
    conversion: number;
    deals: number;
    value: number;
  }>;
}

export const TrendsTab: React.FC<TrendsTabProps> = ({
  chartData
}) => {
  return (
    <div className="space-y-6">
      <div className="h-96">
        <h3 className="text-lg font-semibold mb-4">Channel Performance Trends</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channel" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#8884d8" name="AI Score" strokeWidth={2} />
            <Line type="monotone" dataKey="conversion" stroke="#82ca9d" name="Conversion Rate" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};