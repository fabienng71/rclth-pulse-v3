
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useCRMDashboardData } from '@/hooks/useCRMDashboardData';
import { CRMChartsSection } from '@/components/crm/dashboard/CRMChartsSection';
import { CRMInsightsSection } from '@/components/crm/dashboard/CRMInsightsSection';
import { CRMSidebar } from '@/components/crm/dashboard/CRMSidebar';

const CRMAnalytics = () => {
  const { 
    metrics, 
    isLoading, 
    error 
  } = useCRMDashboardData();

  if (error) {
    return (
      <>
        <Navigation />
        <main className="app-background">
          <div className="container py-6">
            <Card variant="enhanced">
              <CardContent className="pt-6">
                <div className="text-center py-12 text-red-500">
                  <p>Error loading analytics data: {error.message}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="app-background">
        <div className="container py-6 animate-fade-in">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold">CRM Analytics & Insights</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive analysis and performance insights for your CRM data
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left Sidebar - Navigation */}
            <div className="lg:col-span-1">
              <CRMSidebar />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-4">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Charts Section - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <CRMChartsSection metrics={metrics} isLoading={isLoading} />
                </div>

                {/* Insights Section - Takes 1 column */}
                <div className="lg:col-span-1">
                  <CRMInsightsSection metrics={metrics} isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CRMAnalytics;
