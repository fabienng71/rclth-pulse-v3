import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Zap, 
  AlertTriangle,
  Target,
  Users,
  BarChart3,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ItemsV2DashboardStats } from '@/types/itemsV2';
import { cn } from '@/lib/utils';

interface DashboardMetricsProps {
  stats: ItemsV2DashboardStats;
  isLoading?: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  progress?: number;
  alert?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color,
  progress,
  alert
}) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
    orange: 'border-orange-200 bg-orange-50 text-orange-900',
    red: 'border-red-200 bg-red-50 text-red-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  const trendColorClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />;
      case 'down': return <TrendingDown className="h-3 w-3" />;
      default: return <BarChart3 className="h-3 w-3" />;
    }
  };

  return (
    <Card className={cn('relative', colorClasses[color])}>
      {alert && (
        <div className="absolute -top-2 -right-2">
          <AlertTriangle className="h-4 w-4 text-red-500 fill-red-100" />
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-medium", colorClasses[color])}>
          {title}
        </CardTitle>
        <div className={iconColorClasses[color]}>
          {icon}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={cn("text-2xl font-bold", colorClasses[color])}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          {subtitle && (
            <p className={cn("text-xs", iconColorClasses[color])}>
              {subtitle}
            </p>
          )}
          
          {trend && trendValue && (
            <div className={cn("flex items-center text-xs", trendColorClasses[trend])}>
              {getTrendIcon(trend)}
              <span className="ml-1">{trendValue}</span>
            </div>
          )}
        </div>

        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs mt-1">
              <span className={iconColorClasses[color]}>Progress</span>
              <span className={cn("font-medium", colorClasses[color])}>{progress}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  stats,
  isLoading = false,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Items"
          value={stats.total_items}
          subtitle="In your portfolio"
          icon={<Package className="h-4 w-4" />}
          trend="stable"
          trendValue="Active items"
          color="blue"
        />

        <MetricCard
          title="Top Performers"
          value={stats.top_performers}
          subtitle="High-velocity items"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
          trendValue="+12% this month"
          color="green"
          progress={Math.min(100, (stats.top_performers / Math.max(stats.total_items, 1)) * 100)}
        />

        <MetricCard
          title="Quick Wins"
          value={stats.quick_wins}
          subtitle="High margin, fast moving"
          icon={<Zap className="h-4 w-4" />}
          trend="up"
          trendValue="Ready to push"
          color="orange"
        />

        <MetricCard
          title="Stock Alerts"
          value={stats.low_stock_alerts}
          subtitle="Items need reordering"
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={stats.low_stock_alerts > 10 ? 'up' : 'stable'}
          trendValue={stats.low_stock_alerts > 10 ? 'Action needed' : 'Under control'}
          color="red"
          alert={stats.low_stock_alerts > 10}
        />
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales Value"
          value={formatCurrency(stats.total_sales_value)}
          subtitle="Your items performance"
          icon={<DollarSign className="h-4 w-4" />}
          trend={stats.sales_trend_7_days}
          trendValue={stats.sales_trend_7_days === 'up' ? '+8.5% vs last week' : 
                     stats.sales_trend_7_days === 'down' ? '-3.2% vs last week' : 'Stable'}
          color="green"
        />

        <MetricCard
          title="Commission Earned"
          value={formatCurrency(stats.commission_earned)}
          subtitle="This period"
          icon={<Target className="h-4 w-4" />}
          trend="up"
          trendValue="+15% vs target"
          color="purple"
          progress={75} // Mock progress to target
        />

        <MetricCard
          title="Average Margin"
          value={formatPercentage(stats.avg_margin)}
          subtitle="Across your items"
          icon={<Percent className="h-4 w-4" />}
          trend={stats.margin_trend_7_days}
          trendValue={stats.margin_trend_7_days === 'up' ? '+2.1 pts this quarter' : 
                     stats.margin_trend_7_days === 'down' ? '-0.8 pts this quarter' : 'Stable'}
          color="blue"
        />

        <MetricCard
          title="COGS Coverage"
          value={formatPercentage(stats.cogs_coverage_percent)}
          subtitle={`${stats.items_with_cogs} of ${stats.total_items} items`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={stats.cogs_coverage_percent > 80 ? 'up' : stats.cogs_coverage_percent > 60 ? 'stable' : 'down'}
          trendValue={
            stats.cogs_coverage_percent > 80 ? 'Excellent coverage' : 
            stats.cogs_coverage_percent > 60 ? 'Good coverage' : 
            'Needs improvement'
          }
          color={stats.cogs_coverage_percent > 80 ? 'green' : stats.cogs_coverage_percent > 60 ? 'blue' : 'orange'}
          progress={stats.cogs_coverage_percent}
          alert={stats.cogs_coverage_percent < 50}
        />
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-900">
              {stats.best_performing_category || 'Electronics'}
            </div>
            <p className="text-xs text-blue-700">
              Leading in sales velocity
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                Category Champion
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
              <Package className="h-4 w-4" />
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-900">
              {stats.new_items_this_month}
            </div>
            <p className="text-xs text-purple-700">
              New items in portfolio
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                Fresh Inventory
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-900">
              85/100
            </div>
            <p className="text-xs text-green-700">
              Overall portfolio health
            </p>
            <div className="mt-2">
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardMetrics;