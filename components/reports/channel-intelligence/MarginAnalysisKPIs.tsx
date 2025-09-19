import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target, Zap, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MarginAnalysisKPIsProps {
  data: any;
  isLoading: boolean;
}

export const MarginAnalysisKPIs: React.FC<MarginAnalysisKPIsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 bg-gray-100 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const getTrendIcon = (trend: number) => {
    if (trend > 0.05) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -0.05) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Margin</p>
              <p className="text-xl font-bold">{data.avg_margin_percent?.toFixed(1)}%</p>
            </div>
            <Target className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Best Channel</p>
              <p className="text-xl font-bold">{data.best_channel_margin?.toFixed(1)}%</p>
              <p className="text-xs text-green-600">{data.best_channel_name}</p>
            </div>
            <Zap className="h-6 w-6 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Worst Channel</p>
              <p className="text-xl font-bold">{data.worst_channel_margin?.toFixed(1)}%</p>
              <p className="text-xs text-red-600">{data.worst_channel_name}</p>
            </div>
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(data.total_revenue || 0)}</p>
            </div>
            <div className="h-6 w-6 bg-purple-100 rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Margin $</p>
              <p className="text-xl font-bold">{formatCurrency(data.total_margin || 0)}</p>
            </div>
            <div className="h-6 w-6 bg-green-100 rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Channels</p>
              <p className="text-xl font-bold">{data.total_channels || 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="h-6 w-6 bg-orange-100 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};