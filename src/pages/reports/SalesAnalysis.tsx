import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, RefreshCw, TrendingUp, Users, Package, Target, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSalesAnalyticsOptimized } from '@/hooks/useSalesAnalyticsOptimized';
import { useWeekData } from '@/hooks/useWeekData';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { formatNumber, formatCurrency } from '@/utils/formatters';

// Import components (we'll create these next)
import { SalesAnalyticsPeriodSelector } from '@/components/reports/sales-analysis/SalesAnalyticsPeriodSelector';
import { ExecutiveSummaryCards } from '@/components/reports/sales-analysis/ExecutiveSummaryCards';
import { CustomerChurnAnalysis } from '@/components/reports/sales-analysis/CustomerChurnAnalysis';
import { NewCustomerAnalysis } from '@/components/reports/sales-analysis/NewCustomerAnalysis';
import { ProductPerformanceAnalysis } from '@/components/reports/sales-analysis/ProductPerformanceAnalysis';
import { PredictiveAnalytics } from '@/components/reports/sales-analysis/PredictiveAnalytics';
import { SalespersonPerformanceAnalysis } from '@/components/reports/sales-analysis/SalespersonPerformanceAnalysis';
import { DataValidationPanel } from '@/components/reports/sales-analysis/DataValidationPanel';

const SalesAnalysis = () => {
  const navigate = useNavigate();
  const { isAdmin, profile } = useAuthStore();
  const { currentWeek: defaultWeek, currentYear: defaultYear, isLoading: weekDataLoading } = useWeekData();
  
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedSalesperson, setSelectedSalesperson] = useState(isAdmin ? 'all' : profile?.spp_code || '');
  const [analysisType, setAnalysisType] = useState<'weekly' | 'monthly'>('weekly');
  const [activeTab, setActiveTab] = useState('overview');

  // Update selected values when week data loads
  useEffect(() => {
    if (!weekDataLoading && defaultWeek && defaultYear) {
      setSelectedYear(defaultYear);
      setSelectedWeek(defaultWeek);
    }
  }, [weekDataLoading, defaultWeek, defaultYear]);

  // For monthly analysis, pass a representative week to trigger monthly aggregation in hooks
  // The actual monthly aggregation is handled in the individual analytics hooks
  const effectiveWeek = analysisType === 'weekly' ? selectedWeek : 1; // Use week 1 as trigger for monthly analysis
  const effectiveSalesperson = selectedSalesperson === 'all' ? null : selectedSalesperson;

  const {
    customerChurn,
    newCustomers,
    productPerformance,
    salespersonPerformance,
    predictiveChurn,
    executiveSummary,
    dataValidation,
    isLoading,
    isError,
    error,
    refreshAnalytics,
    individualStates
  } = useSalesAnalyticsOptimized(selectedYear, effectiveWeek, effectiveSalesperson, analysisType === 'monthly' ? selectedMonth : undefined);

  const handleRefreshAnalytics = async () => {
    try {
      toast.promise(refreshAnalytics(), {
        loading: 'Refreshing sales analytics...',
        success: 'Analytics refreshed successfully',
        error: 'Failed to refresh analytics'
      });
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  };

  // Check for data validation issues
  const criticalIssues = dataValidation.filter(v => v.severity === 'HIGH' && v.status === 'FAIL');
  const warnings = dataValidation.filter(v => v.severity === 'MEDIUM' && v.status === 'WARN');

  if (isError) {
    return (
      <div className="min-h-screen bg-background-primary transition-smooth">
        <Navigation />
        <main className="container py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">Error loading sales analysis</h2>
            <p className="text-muted-foreground mt-2">{error?.message}</p>
            <Button onClick={handleRefreshAnalytics} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/reports')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Sales Analysis & Churn Detection</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleRefreshAnalytics}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </Button>
        </div>

        <div className="space-y-6">
          {/* Period Selector */}
          <SalesAnalyticsPeriodSelector
            selectedYear={selectedYear}
            selectedWeek={selectedWeek}
            selectedMonth={selectedMonth}
            selectedSalesperson={selectedSalesperson}
            analysisType={analysisType}
            onYearChange={setSelectedYear}
            onWeekChange={setSelectedWeek}
            onMonthChange={setSelectedMonth}
            onSalespersonChange={setSelectedSalesperson}
            onAnalysisTypeChange={setAnalysisType}
          />

          {/* Data Validation Alerts */}
          {criticalIssues.length > 0 && (
            <Alert className="border-destructive bg-soft-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Critical Data Issues:</strong> {criticalIssues.length} critical issues found that may affect analysis accuracy.
                <Button variant="link" className="p-0 h-auto font-medium" onClick={() => setActiveTab('validation')}>
                  View Details
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert className="border-warning bg-soft-warning">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Data Warnings:</strong> {warnings.length} warnings found. 
                <Button variant="link" className="p-0 h-auto font-medium" onClick={() => setActiveTab('validation')}>
                  View Details
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Executive Summary */}
          <ExecutiveSummaryCards 
            summary={executiveSummary}
            isLoading={individualStates.executiveSummary.isLoading}
          />

          {/* Main Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="churn" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Customer Churn
              </TabsTrigger>
              <TabsTrigger value="new-customers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                New Customers
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="predictive" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Predictive
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="validation" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Data Quality
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Customer Risks */}
                <Card className="bg-background-container shadow-soft transition-smooth">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Top Customer Risks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {individualStates.customerChurn.isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading customer risks...</p>
                      </div>
                    ) : customerChurn.length > 0 ? (
                      <div className="space-y-3">
                        {customerChurn.slice(0, 5).map((customer) => (
                          <div key={customer.customer_code} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                            <div>
                              <p className="font-medium">{customer.customer_name || customer.customer_code || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{customer.churn_status}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Risk: {customer.risk_score}%</p>
                              <p className="text-xs text-muted-foreground">Value: {formatCurrency(customer.historical_value)}</p>
                            </div>
                          </div>
                        ))}
                        {customerChurn.length > 5 && (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setActiveTab('churn')}
                          >
                            View All {customerChurn.length} At-Risk Customers
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No customer risks identified</p>
                    )}
                  </CardContent>
                </Card>

                {/* Top Product Opportunities */}
                <Card className="bg-background-container shadow-soft transition-smooth">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Top Product Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {individualStates.productPerformance.isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading product opportunities...</p>
                      </div>
                    ) : productPerformance.length > 0 ? (
                      <div className="space-y-3">
                        {productPerformance
                          .filter(p => p.product_status === 'SURGING' || p.product_status === 'NEW')
                          .slice(0, 5)
                          .map((product) => (
                            <div key={product.item_code} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                              <div>
                                <p className="font-medium">{product.item_description || product.item_code || 'Unknown Product'}</p>
                                <p className="text-sm text-muted-foreground">{product.product_status}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {product.volume_change_percent > 0 ? '+' : ''}{product.volume_change_percent}%
                                </p>
                                <p className="text-xs text-muted-foreground">{formatCurrency(product.current_turnover)}</p>
                              </div>
                            </div>
                          ))}
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setActiveTab('products')}
                        >
                          View All Product Analysis
                        </Button>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No product opportunities identified</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-background-container shadow-soft transition-smooth">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto p-4" 
                      onClick={() => setActiveTab('predictive')}
                    >
                      <div className="text-center">
                        <Target className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">Predictive Analytics</p>
                        <p className="text-sm text-muted-foreground">
                          {predictiveChurn.length} customers at risk
                        </p>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto p-4" 
                      onClick={() => setActiveTab('new-customers')}
                    >
                      <div className="text-center">
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">New Customer Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          {newCustomers.length} new customers
                        </p>
                      </div>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto p-4" 
                      onClick={() => setActiveTab('performance')}
                    >
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">Performance Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          {salespersonPerformance.length} salesperson(s)
                        </p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="churn" className="space-y-6">
              <CustomerChurnAnalysis
                data={customerChurn}
                isLoading={individualStates.customerChurn.isLoading}
                selectedSalesperson={selectedSalesperson}
              />
            </TabsContent>

            <TabsContent value="new-customers" className="space-y-6">
              <NewCustomerAnalysis
                data={newCustomers}
                isLoading={individualStates.newCustomers.isLoading}
                selectedSalesperson={selectedSalesperson}
              />
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <ProductPerformanceAnalysis
                data={productPerformance}
                isLoading={individualStates.productPerformance.isLoading}
                selectedSalesperson={selectedSalesperson}
              />
            </TabsContent>

            <TabsContent value="predictive" className="space-y-6">
              <PredictiveAnalytics
                data={predictiveChurn}
                isLoading={individualStates.predictiveChurn.isLoading}
                selectedSalesperson={selectedSalesperson}
              />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <SalespersonPerformanceAnalysis
                data={salespersonPerformance}
                isLoading={individualStates.salespersonPerformance.isLoading}
                selectedSalesperson={selectedSalesperson}
              />
            </TabsContent>

            <TabsContent value="validation" className="space-y-6">
              <DataValidationPanel
                data={dataValidation}
                isLoading={individualStates.dataValidation.isLoading}
                onRefresh={handleRefreshAnalytics}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SalesAnalysis;