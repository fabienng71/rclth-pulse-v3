import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { ItemInsight } from '@/hooks/useEnhancedWeeklyData';
import { ItemTrendsTable } from './ItemTrendsTable';

interface ItemTrendsTabProps {
  itemInsights: ItemInsight[];
  spikeItems: ItemInsight[];
  dropItems: ItemInsight[];
  newItems: ItemInsight[];
  formatCurrency: (amount: number) => string;
  formatPercentage: (percentage: number) => string;
}

export const ItemTrendsTab: React.FC<ItemTrendsTabProps> = ({
  itemInsights,
  spikeItems,
  dropItems,
  newItems,
  formatCurrency,
  formatPercentage
}) => {
  return (
    <div className="space-y-6">
      {/* Item Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{spikeItems.length}</p>
                <p className="text-xs text-muted-foreground">Spike Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{dropItems.length}</p>
                <p className="text-xs text-muted-foreground">Drop Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{newItems.length}</p>
                <p className="text-xs text-muted-foreground">New Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{itemInsights.length}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Trends Tables */}
      <div className="space-y-4">
        <ItemTrendsTable
          items={spikeItems}
          title="Spike Items"
          emoji="📈"
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />

        <ItemTrendsTable
          items={dropItems}
          title="Declining Items"
          emoji="📉"
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />

        <ItemTrendsTable
          items={newItems}
          title="New Items"
          emoji="🆕"
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />
      </div>
    </div>
  );
};