import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, TrendingUp, GitBranch, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface KPISummaryCardsProps {
  kpis: any;
  isLoading: boolean;
}

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({ kpis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const data = kpis.data;
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Basket Size</p>
              <p className="text-2xl font-bold">{formatCurrency(data.avg_basket_size_overall)}</p>
              <p className="text-xs text-blue-600">{data.active_channels} active channels</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Margin %</p>
              <p className="text-2xl font-bold">{data.avg_margin_percent_overall.toFixed(1)}%</p>
              <p className="text-xs text-green-600">Across all channels</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cross-sell Rate</p>
              <p className="text-2xl font-bold">{data.cross_sell_rate.toFixed(1)}%</p>
              <p className="text-xs text-purple-600">Multi-item baskets</p>
            </div>
            <GitBranch className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{data.total_customers.toLocaleString()}</p>
              <p className="text-xs text-orange-600">{formatCurrency(data.total_revenue)} revenue</p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};