import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertTriangle, Minus } from 'lucide-react';
import { ExecutiveSummary } from '@/hooks/useSalesAnalytics';
import { formatNumber, formatCurrency } from '@/utils/formatters';

interface ExecutiveSummaryCardsProps {
  summary: ExecutiveSummary[];
  isLoading: boolean;
}

export const ExecutiveSummaryCards: React.FC<ExecutiveSummaryCardsProps> = ({
  summary,
  isLoading,
}) => {
  const formatValue = (value: number | null | undefined, unit: string) => {
    if (unit === 'currency') {
      return Math.round(value || 0).toLocaleString();
    }
    if (unit === 'count') {
      return formatNumber(value);
    }
    return formatNumber(value);
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UP':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'DOWN':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">High Alert</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">Medium Alert</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Low Alert</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Customer Metrics':
        return <Users className="h-5 w-5" />;
      case 'Revenue Metrics':
        return <DollarSign className="h-5 w-5" />;
      case 'Churn Metrics':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-background-container shadow-soft transition-smooth">
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-background-secondary rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-background-secondary rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-background-secondary rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary || summary.length === 0) {
    return (
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No executive summary data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {summary.map((metric, index) => (
        <Card key={index} className="bg-background-container shadow-soft transition-smooth hover:shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getCategoryIcon(metric.metric_category)}
                <span className="text-sm font-medium text-muted-foreground">
                  {metric.metric_name}
                </span>
              </div>
              {getAlertBadge(metric.alert_level)}
            </div>
            
            <div className="space-y-2">
              {/* Main Metric */}
              <div className="text-2xl font-bold">
                {formatValue(metric.metric_value, metric.metric_unit)}
              </div>
              
              {/* Comparison */}
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon(metric.trend_direction)}
                <span className="text-muted-foreground">vs</span>
                <span className="font-medium">
                  {formatValue(metric.comparison_value, metric.metric_unit)}
                </span>
                <span className="text-muted-foreground">
                  ({metric.comparison_period})
                </span>
              </div>
              
              {/* Trend Analysis */}
              <div className="flex items-center gap-2">
                <div className={`text-sm px-2 py-1 rounded-full font-medium ${
                  metric.trend_direction === 'UP' ? 'bg-soft-primary text-primary' :
                  metric.trend_direction === 'DOWN' ? 'bg-soft-destructive text-destructive' :
                  'bg-background-secondary text-muted-foreground'
                }`}>
                  {metric.trend_direction === 'UP' ? 'Increasing' :
                   metric.trend_direction === 'DOWN' ? 'Decreasing' : 'Stable'}
                </div>
                
                {/* Change Percentage */}
                {metric.comparison_value > 0 && metric.metric_value !== null && metric.comparison_value !== null && (
                  <div className="text-sm text-muted-foreground">
                    {metric.metric_value > metric.comparison_value ? '+' : ''}
                    {(((metric.metric_value - metric.comparison_value) / metric.comparison_value) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              
              {/* Insight Summary */}
              <div className="text-sm text-muted-foreground bg-background-secondary p-2 rounded">
                {metric.insight_summary}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};