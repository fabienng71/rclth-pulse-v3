import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import { LeadCenter } from '@/types/leadCenter';
import {
  OverviewCards,
  PerformanceTab,
  ProductsTab,
  InsightsTab,
  TrendsTab,
  LoadingState,
  useChannelIntelligence
} from './channel-intelligence';

interface ChannelIntelligenceDashboardProps {
  leads: LeadCenter[];
  onRefresh?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const ChannelIntelligenceDashboard: React.FC<ChannelIntelligenceDashboardProps> = ({ 
  leads, 
  onRefresh 
}) => {
  const {
    channelMetrics,
    productRecommendations,
    isLoading,
    isProcessing,
    chartData,
    categoryData,
    generateChannelMetrics,
    getPerformanceColor,
    formatCurrency,
  } = useChannelIntelligence(leads);

  if (isLoading || isProcessing) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <OverviewCards 
        channelMetrics={channelMetrics}
        formatCurrency={formatCurrency}
      />

      {/* Main Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Channel Intelligence Dashboard</CardTitle>
            <Button size="sm" variant="outline" onClick={generateChannelMetrics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-6">
              <PerformanceTab
                channelMetrics={channelMetrics}
                chartData={chartData}
                getPerformanceColor={getPerformanceColor}
                formatCurrency={formatCurrency}
              />
            </TabsContent>
            
            <TabsContent value="products" className="space-y-6">
              <ProductsTab productRecommendations={productRecommendations} />
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              <InsightsTab
                channelMetrics={channelMetrics}
                categoryData={categoryData}
                colors={COLORS}
              />
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-6">
              <TrendsTab chartData={chartData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};