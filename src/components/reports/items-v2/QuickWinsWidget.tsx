import React, { useState } from 'react';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Package,
  Clock,
  DollarSign,
  Percent,
  ChevronRight,
  FileText,
  Send,
  Eye,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemAnalytics } from '@/types/itemsV2';
import { cn } from '@/lib/utils';

interface QuickWinsWidgetProps {
  items: ItemAnalytics[];
  isLoading?: boolean;
  onViewItem?: (itemCode: string) => void;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
  className?: string;
}

interface OpportunityItem {
  item: ItemAnalytics;
  opportunityType: 'high-margin' | 'fast-mover' | 'stock-urgent' | 'commission-booster';
  opportunityScore: number;
  actionRecommendation: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  potentialValue: number;
}

const OpportunityCard: React.FC<{
  opportunity: OpportunityItem;
  onViewItem?: (itemCode: string) => void;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
}> = ({ opportunity, onViewItem, onQuickQuote, onRequestSample }) => {
  const { item, opportunityType, opportunityScore, actionRecommendation, urgencyLevel, potentialValue } = opportunity;

  const getOpportunityIcon = (type: string) => {
    switch (type) {
      case 'high-margin': return <Percent className="h-4 w-4" />;
      case 'fast-mover': return <Zap className="h-4 w-4" />;
      case 'stock-urgent': return <AlertTriangle className="h-4 w-4" />;
      case 'commission-booster': return <DollarSign className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getOpportunityLabel = (type: string) => {
    switch (type) {
      case 'high-margin': return 'High Margin';
      case 'fast-mover': return 'Fast Mover';
      case 'stock-urgent': return 'Stock Alert';
      case 'commission-booster': return 'Commission Boost';
      default: return 'Opportunity';
    }
  };

  const getOpportunityColor = (type: string) => {
    switch (type) {
      case 'high-margin': return 'bg-green-100 text-green-800 border-green-200';
      case 'fast-mover': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stock-urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'commission-booster': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
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

  return (
    <div className="group border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs", getOpportunityColor(opportunityType))}>
            <span className="flex items-center gap-1">
              {getOpportunityIcon(opportunityType)}
              {getOpportunityLabel(opportunityType)}
            </span>
          </Badge>
          
          <div className={cn("w-2 h-2 rounded-full", getUrgencyColor(urgencyLevel))} />
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-green-600">
            {formatCurrency(potentialValue)}
          </div>
          <div className="text-xs text-muted-foreground">Potential</div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">{item.item_code}</h4>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium">{opportunityScore}/100</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground truncate">
          {item.description || 'No description available'}
        </p>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Price: </span>
            <span className="font-medium">
              {item.unit_price ? formatCurrency(item.unit_price) : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Margin: </span>
            <span className={cn(
              "font-medium",
              item.sales_metrics.margin_percent > 30 ? 'text-green-600' :
              item.sales_metrics.margin_percent > 15 ? 'text-orange-600' : 'text-red-600'
            )}>
              {item.sales_metrics.margin_percent.toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Stock: </span>
            <span className={cn(
              "font-medium",
              item.inventory_intel.stock_status === 'critical' ? 'text-red-600' :
              item.inventory_intel.stock_status === 'low' ? 'text-orange-600' : 'text-green-600'
            )}>
              {item.inventory_intel.current_stock}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Opportunity Score</span>
          <span className="font-medium">{opportunityScore}%</span>
        </div>
        <Progress value={opportunityScore} className="h-1" />
      </div>

      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-3">
        💡 {actionRecommendation}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

        <div className="text-xs text-muted-foreground">
          {urgencyLevel === 'critical' && '🔥 Act now'}
          {urgencyLevel === 'high' && '⚡ High priority'}
          {urgencyLevel === 'medium' && '📈 Good opportunity'}
          {urgencyLevel === 'low' && '💰 Consider this'}
        </div>
      </div>
    </div>
  );
};

export const QuickWinsWidget: React.FC<QuickWinsWidgetProps> = ({
  items,
  isLoading = false,
  onViewItem,
  onQuickQuote,
  onRequestSample,
  className
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-margin' | 'fast-mover' | 'stock-urgent' | 'commission-booster'>('all');

  // Generate opportunities from items
  const generateOpportunities = (items: ItemAnalytics[]): OpportunityItem[] => {
    const opportunities: OpportunityItem[] = [];

    items.forEach(item => {
      // High margin opportunities (margin > 25%)
      if (item.sales_metrics.margin_percent > 25) {
        opportunities.push({
          item,
          opportunityType: 'high-margin',
          opportunityScore: Math.min(100, item.sales_metrics.margin_percent * 2),
          actionRecommendation: `Push this high-margin item (${item.sales_metrics.margin_percent.toFixed(1)}%) to boost profitability`,
          urgencyLevel: item.sales_metrics.margin_percent > 40 ? 'high' : 'medium',
          potentialValue: item.sales_metrics.margin_amount * 2
        });
      }

      // Fast mover opportunities (high velocity)
      if (item.sales_metrics.sales_velocity > 3) {
        opportunities.push({
          item,
          opportunityType: 'fast-mover',
          opportunityScore: Math.min(100, item.sales_metrics.sales_velocity * 20),
          actionRecommendation: `Fast-moving item with ${item.sales_metrics.sales_velocity.toFixed(1)} sales/month. Consider bulk deals`,
          urgencyLevel: item.sales_metrics.sales_velocity > 5 ? 'high' : 'medium',
          potentialValue: item.sales_metrics.sales_velocity * item.sales_metrics.avg_selling_price
        });
      }

      // Stock urgent opportunities (low stock)
      if (item.inventory_intel.stock_status === 'critical' || item.inventory_intel.stock_status === 'low') {
        opportunities.push({
          item,
          opportunityType: 'stock-urgent',
          opportunityScore: item.inventory_intel.stock_status === 'critical' ? 90 : 70,
          actionRecommendation: `${item.inventory_intel.stock_status === 'critical' ? 'Critical' : 'Low'} stock (${item.inventory_intel.current_stock}). Push before restock delay`,
          urgencyLevel: item.inventory_intel.stock_status === 'critical' ? 'critical' : 'high',
          potentialValue: item.inventory_intel.current_stock * (item.unit_price || 0)
        });
      }

      // Commission booster opportunities (high commission impact)
      if (item.commission_impact > 500) {
        opportunities.push({
          item,
          opportunityType: 'commission-booster',
          opportunityScore: Math.min(100, (item.commission_impact / 1000) * 50),
          actionRecommendation: `High commission item (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.commission_impact)}). Focus for earnings boost`,
          urgencyLevel: item.commission_impact > 1000 ? 'high' : 'medium',
          potentialValue: item.commission_impact * 2
        });
      }
    });

    return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
  };

  const opportunities = generateOpportunities(items);
  
  const filteredOpportunities = activeFilter === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.opportunityType === activeFilter);

  const getFilterCount = (type: string) => {
    if (type === 'all') return opportunities.length;
    return opportunities.filter(opp => opp.opportunityType === type).length;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Wins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-2 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Wins
            <Badge variant="secondary" className="ml-2">
              {filteredOpportunities.length} opportunities
            </Badge>
          </CardTitle>

          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-5 text-xs">
            <TabsTrigger value="all" className="text-xs">
              All ({getFilterCount('all')})
            </TabsTrigger>
            <TabsTrigger value="high-margin" className="text-xs">
              Margin ({getFilterCount('high-margin')})
            </TabsTrigger>
            <TabsTrigger value="fast-mover" className="text-xs">
              Velocity ({getFilterCount('fast-mover')})
            </TabsTrigger>
            <TabsTrigger value="stock-urgent" className="text-xs">
              Stock ({getFilterCount('stock-urgent')})
            </TabsTrigger>
            <TabsTrigger value="commission-booster" className="text-xs">
              Commission ({getFilterCount('commission-booster')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-4">
            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  No opportunities found
                </h3>
                <p className="text-xs text-gray-500">
                  {activeFilter === 'all' 
                    ? 'Continue selling to generate quick win opportunities.'
                    : `No ${activeFilter.replace('-', ' ')} opportunities available right now.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOpportunities.slice(0, 10).map((opportunity, index) => (
                  <OpportunityCard
                    key={`${opportunity.item.item_code}-${opportunity.opportunityType}-${index}`}
                    opportunity={opportunity}
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
        {filteredOpportunities.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="font-bold text-green-600">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
                    .format(filteredOpportunities.reduce((sum, opp) => sum + opp.potentialValue, 0))}
                </div>
                <div className="text-muted-foreground">Total Potential</div>
              </div>

              <div>
                <div className="font-bold text-blue-600">
                  {Math.round(filteredOpportunities.reduce((sum, opp) => sum + opp.opportunityScore, 0) / filteredOpportunities.length)}
                </div>
                <div className="text-muted-foreground">Avg Score</div>
              </div>

              <div>
                <div className="font-bold text-orange-600">
                  {filteredOpportunities.filter(opp => opp.urgencyLevel === 'critical' || opp.urgencyLevel === 'high').length}
                </div>
                <div className="text-muted-foreground">High Priority</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Quote All
          </Button>

          <Button size="sm" variant="outline" className="flex-1">
            <Target className="h-4 w-4 mr-2" />
            Set Reminders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickWinsWidget;