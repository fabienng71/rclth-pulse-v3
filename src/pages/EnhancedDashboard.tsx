import React, { useState, useEffect, useCallback } from 'react';
import { startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { EnhancedDashboardMetrics } from '@/components/dashboard/EnhancedDashboardMetrics';
import { EnhancedMonthlyTurnoverTable } from '@/components/dashboard/EnhancedMonthlyTurnoverTable';
import { WeeklyDataDisplay } from '@/components/dashboard/WeeklyDataDisplay';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { useEnhancedDashboardData } from '@/hooks/dashboard/useEnhancedDashboardData';
import { usePersistedDashboardSettings } from '@/hooks/dashboard/usePersistedDashboardSettings';
import { 
  InfoIcon, 
  RefreshCwIcon, 
  TrendingUpIcon, 
  AlertTriangleIcon,
  ExternalLinkIcon
} from 'lucide-react';

const EnhancedDashboard = () => {
  console.log('=== LOADING ENHANCED DASHBOARD WITH CREDIT MEMO INTEGRATION ===');
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuthStore();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>('all');
  const [dashboardSettings, setDashboardSettings, isSettingsLoaded] = usePersistedDashboardSettings();
  
  // Get dates directly from settings
  const fromDate = dashboardSettings.fromDate ? parseISO(dashboardSettings.fromDate) : startOfMonth(subMonths(new Date(), 6));
  const toDate = dashboardSettings.toDate ? parseISO(dashboardSettings.toDate) : endOfMonth(new Date());
  
  // Date change handlers that update settings directly
  const handleFromDateChange = useCallback((date: Date) => {
    setDashboardSettings({
      ...dashboardSettings,
      fromDate: date.toISOString()
    });
  }, [dashboardSettings, setDashboardSettings]);
  
  const handleToDateChange = useCallback((date: Date) => {
    setDashboardSettings({
      ...dashboardSettings,
      toDate: date.toISOString()
    });
  }, [dashboardSettings, setDashboardSettings]);

  // Use the enhanced dashboard data hook
  const {
    dashboardSummary,
    dashboardMetrics,
    monthlyAverageTurnover,
    creditMemoSummary,
    isLoading,
    error,
    refetch
  } = useEnhancedDashboardData(
    fromDate, 
    toDate, 
    selectedSalesperson !== 'all' ? selectedSalesperson : undefined
  );

  // Get salesperson name for display
  const getSalespersonName = (code: string) => {
    if (code === 'all') return 'All Salespeople';
    return code; // In a real app, you'd look this up from a salespeople table
  };

  // Navigation handlers
  const handleViewCreditMemoDetails = () => {
    navigate('/reports/credit-memo');
  };

  const handleViewFullReport = () => {
    navigate('/reports');
  };

  const handleViewCreditMemoMonth = (month: string) => {
    navigate(`/reports/credit-memo?month=${month}`);
  };

  const handleRefresh = () => {
    refetch();
  };

  const hasSignificantCreditMemoImpact = dashboardMetrics 
    && dashboardMetrics.creditMemoImpact > 10;

  // Debug logging
  console.log('Enhanced Dashboard Debug:', {
    isLoading,
    error: error?.message,
    dashboardSummary: !!dashboardSummary,
    dashboardMetrics: !!dashboardMetrics,
    creditMemoSummary: !!creditMemoSummary,
    user: !!user,
    profile: !!profile,
    isAdmin,
    dashboardSettings
  });

  // Show loading state while settings are hydrating
  if (!isSettingsLoaded) {
    return (
      <div className="app-background min-h-screen">
        <Navigation />
        <div className="section-background m-4 rounded-lg border border-border/30">
          <div className="container mx-auto px-6 py-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-background min-h-screen">
      <Navigation />
      <div className="section-background m-4 rounded-lg border border-border/30">
        <div className="container mx-auto px-6 py-4 space-y-4">
          

          {/* Compact Header with Inline Controls */}
          <DashboardHeader
            fromDate={fromDate}
            toDate={toDate}
            salespersonCode={selectedSalesperson}
            onFromDateChange={handleFromDateChange}
            onToDateChange={handleToDateChange}
            onSalespersonChange={setSelectedSalesperson}
          />

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Enhanced Dashboard Error</div>
                <div className="text-sm mt-1">{error.message}</div>
                <div className="text-xs mt-2 text-gray-600">
                  This might be due to missing database functions. Check the deployment status.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-2"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading enhanced dashboard data...</p>
            </div>
          )}




          {/* Enhanced Metrics */}
          {!isLoading && !error && (
            <EnhancedDashboardMetrics
              metrics={dashboardMetrics}
              isLoading={isLoading}
              error={error}
              fromDate={fromDate}
              toDate={toDate}
              salespersonCode={selectedSalesperson}
              salespersonName={getSalespersonName(selectedSalesperson)}
              onViewCreditMemoDetails={handleViewCreditMemoDetails}
              onViewFullReport={handleViewFullReport}
            />
          )}


          {/* Enhanced Monthly Turnover Table */}
          <EnhancedMonthlyTurnoverTable
            monthlyTurnover={dashboardSummary?.monthly_data}
            isLoading={isLoading}
            error={error}
            showCreditMemoDetails={dashboardSettings.showCreditMemoDetails}
            onViewCreditMemoDetails={handleViewCreditMemoMonth}
          />

          {/* Weekly Insights */}
          <Card variant="enhanced" className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Weekly Insights</h2>
            <WeeklyDataDisplay 
              salespersonCode={selectedSalesperson !== 'all' ? selectedSalesperson : undefined} 
            />
          </Card>

          {/* Dashboard Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Enhanced Dashboard Features</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <div className="font-medium mb-1">✓ Credit Memo Integration</div>
                <div className="text-xs">Revenue calculations now include credit memo adjustments</div>
              </div>
              <div>
                <div className="font-medium mb-1">✓ Net Revenue Analysis</div>
                <div className="text-xs">Accurate financial picture with credit memo impacts</div>
              </div>
              <div>
                <div className="font-medium mb-1">✓ Performance Optimization</div>
                <div className="text-xs">Batched queries for faster loading</div>
              </div>
              <div>
                <div className="font-medium mb-1">✓ Enhanced Monitoring</div>
                <div className="text-xs">Real-time alerts for credit memo impact</div>
              </div>
            </div>
          </div>

          {/* Data Quality Indicators */}
          {dashboardSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 font-medium">Data Quality</div>
                <div className="text-gray-800">
                  {dashboardSummary.total_transactions} transactions processed
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 font-medium">Credit Memo Coverage</div>
                <div className="text-gray-800">
                  {dashboardSummary.credit_memo_count} credit memos included
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 font-medium">Data Integrity</div>
                <div className="text-gray-800">
                  {creditMemoSummary?.isIncludedInCalculations ? 'Verified' : 'Needs Review'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;