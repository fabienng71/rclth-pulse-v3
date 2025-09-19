import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BarChart3,
  RefreshCw,
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  useChannelIntelligenceDashboard,
  useChannelsList,
  useCustomersForChannelIntelligence,
  useDateRangePresets,
  useChannelMarginAnalysis,
  useProductMarginPerformance,
  useMarginOptimizationOpportunities,
  useMarginTrends,
  usePostingGroupsForMarginAnalysis,
  type ChannelIntelligenceFilters 
} from '@/hooks/useChannelIntelligence';

// Import extracted components
import {
  KPISummaryCards,
  ChannelProductDetail,
  ChannelBasketOverviewTable,
  CustomerPerformanceTable,
  MarginAnalysisKPIs,
  ChannelMarginMatrix,
  ProductMarginIntelligence,
  MarginOptimizationOpportunities,
  CrossSellOpportunitiesCard
} from '@/components/reports/channel-intelligence';

// Main Channel Intelligence Report Component
const ChannelIntelligenceReport: React.FC = () => {
  const { isAdmin } = useAuthStore();
  const { getDateRange } = useDateRangePresets();
  
  // State for filters
  const [currentDatePreset, setCurrentDatePreset] = useState('last_90_days');
  const [filters, setFilters] = useState<ChannelIntelligenceFilters>({
    dateRange: getDateRange('last_90_days'),
    selectedChannels: [],
    selectedCustomer: undefined,
    metricFocus: 'basket_analysis'
  });
  const [viewType, setViewType] = useState<'summary' | 'detailed'>('summary');
  const [activeTab, setActiveTab] = useState('basket_overview');
  const [customerLimit, setCustomerLimit] = useState(20);
  const [selectedChannel, setSelectedChannel] = useState<{ code: string, name: string } | null>(null);

  // Data hooks
  const channelsList = useChannelsList();
  const customersList = useCustomersForChannelIntelligence();
  const dashboardData = useChannelIntelligenceDashboard(filters);
  
  // Margin analysis data hooks
  const marginAnalysisData = useChannelMarginAnalysis(
    filters.dateRange.start_date,
    filters.dateRange.end_date
  );

  const handleChannelClick = (channelCode: string, channelName: string) => {
    setSelectedChannel({ code: channelCode, name: channelName });
  };

  const handleBackToOverview = () => {
    setSelectedChannel(null);
  };

  // Admin access check
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleDateRangeChange = (preset: string) => {
    setCurrentDatePreset(preset);
    setFilters(prev => ({
      ...prev,
      dateRange: getDateRange(preset)
    }));
  };

  const handleChannelChange = (channels: string[]) => {
    setFilters(prev => ({
      ...prev,
      selectedChannels: channels
    }));
  };

  const handleCustomerChange = (customer: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      selectedCustomer: customer
    }));
  };

  const handleMetricFocusChange = (focus: string) => {
    setFilters(prev => ({
      ...prev,
      metricFocus: focus as any
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Channel Intelligence
              </h1>
              <p className="mt-2 text-gray-600">
                Deep insights into channel performance, customer behavior, and margin optimization
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Analysis Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <Select value={currentDatePreset} onValueChange={handleDateRangeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                    <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                    <SelectItem value="last_12_months">Last 12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Type Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">View Type</label>
                <ToggleGroup
                  type="single"
                  value={viewType}
                  onValueChange={(value) => value && setViewType(value as 'summary' | 'detailed')}
                  className="justify-start"
                >
                  <ToggleGroupItem value="summary" className="px-3">
                    Summary
                  </ToggleGroupItem>
                  <ToggleGroupItem value="detailed" className="px-3">
                    Detailed
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Metric Focus */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Focus</label>
                <Select value={filters.metricFocus} onValueChange={handleMetricFocusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basket_analysis">Basket Analysis</SelectItem>
                    <SelectItem value="margin_analysis">Margin Analysis</SelectItem>
                    <SelectItem value="customer_insights">Customer Insights</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary Cards */}
        <KPISummaryCards 
          kpis={dashboardData.kpis} 
          isLoading={dashboardData.kpis.isLoading}
        />

        {/* Error Alert */}
        {dashboardData.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              {dashboardData.error.message}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basket_overview">Basket Overview</TabsTrigger>
            <TabsTrigger value="margin_analysis">Margin Analysis</TabsTrigger>
            <TabsTrigger value="customer_insights">Customer Insights</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basket Overview */}
          <TabsContent value="basket_overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {selectedChannel ? (
                <ChannelProductDetail 
                  channelCode={selectedChannel.code}
                  channelName={selectedChannel.name}
                  onBack={handleBackToOverview}
                  dateRange={filters.dateRange}
                />
              ) : (
                <ChannelBasketOverviewTable 
                  data={dashboardData.channelOverview.data || []} 
                  isLoading={dashboardData.channelOverview.isLoading}
                  onChannelClick={handleChannelClick}
                />
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Margin Analysis */}
          <TabsContent value="margin_analysis" className="space-y-6">
            <MarginAnalysisKPIs 
              data={marginAnalysisData.data || []} 
              isLoading={marginAnalysisData.isLoading}
            />
            <div className="grid grid-cols-1 gap-6">
              <ChannelMarginMatrix 
                data={marginAnalysisData.data || []} 
                isLoading={marginAnalysisData.isLoading}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProductMarginIntelligence 
                  data={marginAnalysisData.data || []} 
                  isLoading={marginAnalysisData.isLoading}
                />
                <MarginOptimizationOpportunities 
                  data={marginAnalysisData.data || []} 
                  isLoading={marginAnalysisData.isLoading}
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Customer Insights */}
          <TabsContent value="customer_insights" className="space-y-6">
            <CustomerPerformanceTable 
              data={dashboardData.customerPerformance.data || []} 
              isLoading={dashboardData.customerPerformance.isLoading}
              limit={customerLimit}
              onLimitChange={setCustomerLimit}
            />
          </TabsContent>

          {/* Tab 4: Opportunities */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <CrossSellOpportunitiesCard 
                data={dashboardData.crossSellOpportunities.data || []} 
                isLoading={dashboardData.crossSellOpportunities.isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ChannelIntelligenceReport;