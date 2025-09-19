import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Grid3X3, List, Filter, Download, Search, Zap, TrendingUp, Settings } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useItemsV2Data } from '@/hooks/useItemsV2Data';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { DashboardMetrics } from '@/components/reports/items-v2/DashboardMetrics';
import { TopPerformersWidget } from '@/components/reports/items-v2/TopPerformersWidget';
import { CommissionCalculator } from '@/components/reports/items-v2/CommissionCalculator';
import { QuickWinsWidget } from '@/components/reports/items-v2/QuickWinsWidget';
import { ItemsGrid } from '@/components/reports/items-v2/ItemsGrid';
import { ItemsTable } from '@/components/reports/items-v2/ItemsTable';
import { AdvancedFilters } from '@/components/reports/items-v2/AdvancedFilters';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ItemsV2ViewConfig } from '@/types/itemsV2';

const ItemsReportV2 = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  
  // Component state
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewConfig, setViewConfig] = useState<ItemsV2ViewConfig>({
    layout: 'cards',
    card_size: 'standard',
    show_charts: true,
    show_metrics: true,
    show_actions: true
  });

  // Initialize filter options hook
  const { data: filterOptions, isLoading: isLoadingFilters } = useFilterOptions();

  // Initialize enhanced data hook
  const {
    items,
    dashboardStats,
    pagination,
    filters,
    sortOptions,
    searchTerm,
    isLoading,
    error,
    setFilters,
    setSortOptions,
    setSearchTerm,
    refetch,
    resetFilters,
    exportData
  } = useItemsV2Data({
    page: currentPage,
    pageSize: 50,
    initialView: viewConfig,
    enableRealTime: true
  });

  const handleBackClick = () => {
    navigate('/reports');
  };

  const handleViewItem = (itemCode: string) => {
    navigate(`/reports/items/v2/item/${itemCode}`);
  };

  const handleQuickQuote = (itemCode: string) => {
    // TODO: Integrate with quotation system
    console.log('Quick quote for:', itemCode);
    // navigate to quotation creation with pre-filled item
  };

  const handleRequestSample = (itemCode: string) => {
    // TODO: Integrate with sample request system
    console.log('Request sample for:', itemCode);
    // navigate to sample request with pre-filled item
  };

  const handleToggleFavorite = (itemCode: string) => {
    // TODO: Implement favorites system
    console.log('Toggle favorite for:', itemCode);
  };

  const handleExport = async () => {
    try {
      await exportData({
        format: 'excel',
        include_metrics: true,
        include_charts: false,
        filtered_data_only: true
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const hasFiltersApplied = Object.keys(filters).length > 1; // More than just search_term

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <main className="container py-6 space-y-6">
        {/* Header with Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBackClick} 
              className="shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold md:text-3xl">Items Intelligence v2</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Sales-focused analytics and insights for {profile?.full_name || 'your items'}
              </p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="hidden md:inline-flex">
              <Zap className="h-3 w-3 mr-1" />
              Beta
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFiltersDialogOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Enhanced Dashboard Metrics */}
        <DashboardMetrics 
          stats={dashboardStats} 
          isLoading={isLoading}
        />

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Search items by code, description, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFiltersDialogOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasFiltersApplied && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      •
                    </Badge>
                  )}
                </Button>
                
                <div className="flex border rounded-md">
                  <Button
                    variant={viewConfig.layout === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewConfig(prev => ({ ...prev, layout: 'cards' }))}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewConfig.layout === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewConfig(prev => ({ ...prev, layout: 'table' }))}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Main items list */}
          <TabsContent value="overview" className="space-y-6">
            {viewConfig.layout === 'cards' ? (
              <ItemsGrid
                items={items}
                isLoading={isLoading}
                viewConfig={viewConfig}
                searchTerm={searchTerm}
                hasFiltersApplied={hasFiltersApplied}
                onQuickQuote={handleQuickQuote}
                onRequestSample={handleRequestSample}
                onViewDetails={handleViewItem}
                onToggleFavorite={handleToggleFavorite}
                onClearFilters={resetFilters}
                onShowFilters={() => setIsFiltersDialogOpen(true)}
              />
            ) : (
              <ItemsTable
                items={items}
                isLoading={isLoading}
                viewConfig={viewConfig}
                sortOptions={sortOptions}
                onSortChange={setSortOptions}
                onQuickQuote={handleQuickQuote}
                onRequestSample={handleRequestSample}
                onViewDetails={handleViewItem}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </TabsContent>

          {/* Performance Tab - Dashboard widgets */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopPerformersWidget
                items={items}
                isLoading={isLoading}
                onViewItem={handleViewItem}
                onQuickQuote={handleQuickQuote}
                onRequestSample={handleRequestSample}
              />
              
              <QuickWinsWidget
                items={items}
                isLoading={isLoading}
                onViewItem={handleViewItem}
                onQuickQuote={handleQuickQuote}
                onRequestSample={handleRequestSample}
              />
            </div>
          </TabsContent>

          {/* Intelligence Tab - AI insights and commission calculator */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <CommissionCalculator
                  items={items}
                  currentCommission={dashboardStats.commission_earned}
                  monthlyTarget={10000} // TODO: Get from user settings
                />
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Market Trend</h4>
                        <p className="text-sm text-blue-700">
                          Electronics category showing 15% growth this quarter. Consider focusing on high-margin items.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-1">Opportunity</h4>
                        <p className="text-sm text-green-700">
                          3 customers haven't ordered in 60+ days. Reach out with personalized offers.
                        </p>
                      </div>
                      
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-1">Stock Alert</h4>
                        <p className="text-sm text-orange-700">
                          {dashboardStats.low_stock_alerts} items running low. Consider pre-orders to avoid stockouts.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab - Future charts and visual analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Visual Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Charts & Visualizations</h3>
                  <p>Advanced charts, trend lines, and heat maps coming in the next update</p>
                  <Button variant="outline" className="mt-4">
                    Request Early Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Advanced Filters Dialog */}
        <Dialog open={isFiltersDialogOpen} onOpenChange={setIsFiltersDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Filters & Settings</DialogTitle>
            </DialogHeader>
            <AdvancedFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1); // Reset pagination when filters change
              }}
              onClose={() => setIsFiltersDialogOpen(false)}
              availableOptions={{
                categories: filterOptions.categories,
                brands: filterOptions.brands,
                vendors: filterOptions.vendors
              }}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ItemsReportV2;