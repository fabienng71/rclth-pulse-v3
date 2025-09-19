import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  BarChart3,
  Zap,
  User,
  Calendar,
  ShoppingCart,
  Star,
  MoreVertical,
  Eye,
  FileText,
  Send,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ItemAnalytics, ItemsV2ViewConfig } from '@/types/itemsV2';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: ItemAnalytics;
  viewConfig: ItemsV2ViewConfig;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
  onViewDetails?: (itemCode: string) => void;
  onToggleFavorite?: (itemCode: string) => void;
  className?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  viewConfig,
  onQuickQuote,
  onRequestSample,
  onViewDetails,
  onToggleFavorite,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      case 'adequate': return 'text-green-600 bg-green-50';
      case 'high': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  const cardSize = viewConfig.card_size;
  const isCompact = cardSize === 'compact';
  const isDetailed = cardSize === 'detailed';

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200 cursor-pointer",
      "border-l-4",
      item.priority_level === 'critical' && "border-l-red-500",
      item.priority_level === 'high' && "border-l-orange-500", 
      item.priority_level === 'medium' && "border-l-blue-500",
      item.priority_level === 'low' && "border-l-gray-300",
      className
    )}
    onClick={() => !isExpanded && onViewDetails?.(item.item_code)}
  >
    <CardHeader className={cn("pb-2", isCompact && "pb-1")}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant="outline" 
              className={cn("text-xs", getPriorityColor(item.priority_level))}
            >
              {item.priority_level.toUpperCase()}
            </Badge>
            {item.inventory_intel.stock_status === 'critical' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          
          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
            {item.item_code}
          </h3>
          
          {!isCompact && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {item.description || 'No description available'}
            </p>
          )}
          
          {!isCompact && (item.brand || item.vendor_code) && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {item.brand && (
                <Badge variant="secondary" className="text-xs">
                  {item.brand}
                </Badge>
              )}
              {item.vendor_code && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {item.vendor_code}
                </span>
              )}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails?.(item.item_code)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickQuote?.(item.item_code)}>
              <FileText className="h-4 w-4 mr-2" />
              Quick Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRequestSample?.(item.item_code)}>
              <Send className="h-4 w-4 mr-2" />
              Request Sample
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggleFavorite?.(item.item_code)}>
              <Heart className="h-4 w-4 mr-2" />
              Add to Favorites
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>

    <CardContent className={cn("space-y-3", isCompact && "space-y-2")}>
      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="font-semibold">
              {item.unit_price ? formatCurrency(item.unit_price) : 'N/A'}
            </span>
          </div>
          
          {viewConfig.show_metrics && !isCompact && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Margin</span>
                {/* COGS availability indicator */}
                {(item as any).cogs_available ? (
                  <div className="h-2 w-2 rounded-full bg-green-500" title="COGS data available - accurate margin" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-orange-400" title="COGS data estimated - margin may be approximate" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-sm font-medium",
                  item.sales_metrics.margin_percent > 30 ? "text-green-600" :
                  item.sales_metrics.margin_percent > 15 ? "text-orange-600" : 
                  item.sales_metrics.margin_percent > 0 ? "text-red-600" : "text-gray-400"
                )}>
                  {item.sales_metrics.margin_percent > 0 ? `${item.sales_metrics.margin_percent.toFixed(1)}%` : 'N/A'}
                </span>
                {getTrendIcon(item.demand_trend || 'stable')}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stock</span>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getStockStatusColor(item.inventory_intel.stock_status))}
            >
              {item.inventory_intel.current_stock}
            </Badge>
          </div>
          
          {viewConfig.show_metrics && !isCompact && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Velocity</span>
              <span className="text-sm font-medium">
                {item.sales_velocity?.toFixed(1) || '0'}/mo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Score */}
      {viewConfig.show_metrics && !isCompact && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Performance Score</span>
            <span className="text-sm font-semibold">
              {Math.round(item.overall_performance_score)}/100
            </span>
          </div>
          <Progress 
            value={item.overall_performance_score} 
            className="h-2"
          />
        </div>
      )}

      {/* Sales Intelligence */}
      {isDetailed && (
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShoppingCart className="h-3 w-3" />
              Total Sales
            </div>
            <div className="font-semibold">
              {formatCurrency(item.sales_metrics.total_sales_amount)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Commission
            </div>
            <div className="font-semibold text-green-600">
              {formatCurrency(item.commission_impact)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Last Sale
            </div>
            <div className="text-sm">
              {formatDate(item.sales_metrics.last_sale_date)}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              Orders
            </div>
            <div className="text-sm">
              {item.sales_metrics.total_orders}
            </div>
          </div>
        </div>
      )}

      {/* Cost Information - Enhanced for COGS visibility */}
      {isDetailed && (item as any).cogs_available && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Cost Analysis Available</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Unit Cost (COGS)</div>
              <div className="font-semibold text-sm">
                {(item as any).cogs_unit ? formatCurrency((item as any).cogs_unit) : 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Margin Amount</div>
              <div className="font-semibold text-sm text-green-600">
                {formatCurrency(item.sales_metrics.margin_amount)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COGS Data Warning for items without cost data */}
      {isDetailed && !(item as any).cogs_available && (
        <div className="pt-2 border-t border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700">Limited Cost Data</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Margin calculations may be estimates. Contact admin for cost data updates.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {viewConfig.show_actions && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onQuickQuote?.(item.item_code);
            }}
          >
            <FileText className="h-4 w-4 mr-1" />
            Quote
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onRequestSample?.(item.item_code);
            }}
          >
            <Send className="h-4 w-4 mr-1" />
            Sample
          </Button>
          
          {!isCompact && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Recommended Actions */}
      {isDetailed && item.recommended_actions.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Zap className="h-3 w-3" />
            Recommendations
          </div>
          <div className="space-y-1">
            {item.recommended_actions.slice(0, 2).map((action, index) => (
              <div key={index} className="text-xs text-orange-600 font-medium">
                • {action}
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
  );
};

export default ItemCard;