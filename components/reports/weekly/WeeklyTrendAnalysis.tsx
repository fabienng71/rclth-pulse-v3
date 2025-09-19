import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Package } from 'lucide-react';
import { CustomerInsight, ItemInsight } from '@/hooks/useEnhancedWeeklyData';
import {
  LoadingState,
  CustomerTrendsTab,
  ItemTrendsTab,
  useWeeklyTrendAnalysis
} from './trend-analysis';

interface WeeklyTrendAnalysisProps {
  customerInsights: CustomerInsight[];
  itemInsights: ItemInsight[];
  growingCustomers: CustomerInsight[];
  atRiskCustomers: CustomerInsight[];
  newCustomers: CustomerInsight[];
  reactivatedCustomers?: CustomerInsight[];
  spikeItems: ItemInsight[];
  dropItems: ItemInsight[];
  newItems: ItemInsight[];
  isLoading?: boolean;
}

export const WeeklyTrendAnalysis: React.FC<WeeklyTrendAnalysisProps> = ({
  customerInsights,
  itemInsights,
  growingCustomers,
  atRiskCustomers,
  newCustomers,
  reactivatedCustomers = [],
  spikeItems,
  dropItems,
  newItems,
  isLoading = false,
}) => {
  const { formatCurrency, formatPercentage } = useWeeklyTrendAnalysis();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Weekly Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customer Trends
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Item Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-4">
            <CustomerTrendsTab
              customerInsights={customerInsights}
              growingCustomers={growingCustomers}
              atRiskCustomers={atRiskCustomers}
              newCustomers={newCustomers}
              reactivatedCustomers={reactivatedCustomers}
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
            />
          </TabsContent>

          <TabsContent value="items" className="mt-4">
            <ItemTrendsTab
              itemInsights={itemInsights}
              spikeItems={spikeItems}
              dropItems={dropItems}
              newItems={newItems}
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};