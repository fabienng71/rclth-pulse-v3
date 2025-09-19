import React, { useState } from 'react';
import { 
  Star, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Zap,
  ChevronRight,
  Medal,
  Trophy,
  Award,
  Eye,
  FileText,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemAnalytics } from '@/types/itemsV2';
import { cn } from '@/lib/utils';

interface TopPerformersWidgetProps {
  items: ItemAnalytics[];
  isLoading?: boolean;
  onViewItem?: (itemCode: string) => void;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
  className?: string;
}

interface TopPerformerItemProps {
  item: ItemAnalytics;
  rank: number;
  metric: 'sales' | 'margin' | 'velocity' | 'commission';
  onViewItem?: (itemCode: string) => void;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
}

const TopPerformerItem: React.FC<TopPerformerItemProps> = ({
  item,
  rank,
  metric,
  onViewItem,
  onQuickQuote,
  onRequestSample
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-600" />;
      default: return <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">{rank}</div>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getMetricValue = (item: ItemAnalytics, metric: string) => {
    switch (metric) {
      case 'sales':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
          .format(item.sales_metrics.total_sales_amount);
      case 'margin':
        return `${item.sales_metrics.margin_percent.toFixed(1)}%`;
      case 'velocity':
        return `${item.sales_metrics.sales_velocity.toFixed(1)}/mo`;
      case 'commission':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
          .format(item.commission_impact);
      default:
        return '—';
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'sales': return <DollarSign className="h-3 w-3" />;
      case 'margin': return <TrendingUp className="h-3 w-3" />;
      case 'velocity': return <Zap className="h-3 w-3" />;
      case 'commission': return <Star className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="group flex items-center p-4 rounded-lg border hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Rank */}
        <div className="flex items-center justify-center">
          {getRankIcon(rank)}
        </div>

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{item.item_code}</h4>
            <Badge className={cn("text-xs px-2 py-0.5", getRankBadgeColor(rank))}>
              #{rank}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground truncate">
            {item.description || 'No description'}
          </p>
          
          {item.brand && (
            <Badge variant="secondary" className="text-xs mt-1">
              {item.brand}
            </Badge>
          )}
        </div>

        {/* Metric Value */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="font-semibold text-sm">
              {getMetricValue(item, metric)}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getMetricIcon(metric)}
              <span className="capitalize">{metric}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onViewItem?.(item.item_code);
          }}
        >
          <Eye className="h-3 w-3" />
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onQuickQuote?.(item.item_code);
          }}
        >
          <FileText className="h-3 w-3" />
        </Button>
        
        <Button 
          size="sm" 
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onRequestSample?.(item.item_code);
          }}
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export const TopPerformersWidget: React.FC<TopPerformersWidgetProps> = ({
  items,
  isLoading = false,
  onViewItem,
  onQuickQuote,
  onRequestSample,
  className
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'margin' | 'velocity' | 'commission'>('sales');

  // Sort items based on selected metric
  const getSortedItems = (metric: string) => {
    const sortedItems = [...items].sort((a, b) => {
      switch (metric) {
        case 'sales':
          return b.sales_metrics.total_sales_amount - a.sales_metrics.total_sales_amount;
        case 'margin':
          return b.sales_metrics.margin_percent - a.sales_metrics.margin_percent;
        case 'velocity':
          return b.sales_metrics.sales_velocity - a.sales_metrics.sales_velocity;
        case 'commission':
          return b.commission_impact - a.commission_impact;
        default:
          return 0;
      }
    });
    return sortedItems.slice(0, 10); // Top 10
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center p-3 rounded-lg border animate-pulse">
                <div className="h-6 w-6 bg-gray-200 rounded-full mr-3" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topItems = getSortedItems(selectedMetric);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Performers
          </CardTitle>
          
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Selector */}
        <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales" className="text-xs">
              Sales
            </TabsTrigger>
            <TabsTrigger value="margin" className="text-xs">
              Margin
            </TabsTrigger>
            <TabsTrigger value="velocity" className="text-xs">
              Velocity
            </TabsTrigger>
            <TabsTrigger value="commission" className="text-xs">
              Commission
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedMetric} className="mt-4">
            {topItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-xs text-gray-500">
                  Start selling items to see your top performers here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {topItems.map((item, index) => (
                  <TopPerformerItem
                    key={item.item_code}
                    item={item}
                    rank={index + 1}
                    metric={selectedMetric}
                    onViewItem={onViewItem}
                    onQuickQuote={onQuickQuote}
                    onRequestSample={onRequestSample}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        {topItems.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {new Intl.NumberFormat().format(
                    topItems.reduce((sum, item) => sum + item.sales_metrics.total_sales_amount, 0)
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Total Sales</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-green-600">
                  {(topItems.reduce((sum, item) => sum + item.sales_metrics.margin_percent, 0) / topItems.length).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Margin</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Bulk Quote
          </Button>
          
          <Button size="sm" variant="outline" className="flex-1">
            <Package className="h-4 w-4 mr-2" />
            Stock Check
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerformersWidget;