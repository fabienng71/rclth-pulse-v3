import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Clock, Package } from 'lucide-react';

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

interface InsightsTabProps {
  channelMetrics: ChannelMetrics[];
  categoryData: Array<{ category: string; value: number; name: string }>;
  colors: string[];
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  channelMetrics,
  categoryData,
  colors
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Channel Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Top Performer</span>
                </div>
                <p className="text-sm text-green-700">
                  {channelMetrics[0]?.channelName} shows highest AI compatibility with {Math.round(channelMetrics[0]?.avgScore || 0)} average score
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Sales Cycle</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Average sales cycle: {Math.round(channelMetrics.reduce((sum, m) => sum + m.avgSalesCycle, 0) / channelMetrics.length || 0)} days
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Opportunity</span>
                </div>
                <p className="text-sm text-blue-700">
                  Focus on premium channels (HTL-FIV, RES-FRA) for highest value deals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};