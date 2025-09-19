
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCRMDashboardData } from '@/hooks/useCRMDashboardData';
import { CRMMetricsHeader } from '@/components/crm/dashboard/CRMMetricsHeader';
import { CRMSidebar } from '@/components/crm/dashboard/CRMSidebar';
import { CRMQuickActionsBar } from '@/components/crm/dashboard/CRMQuickActionsBar';
import { OverdueFollowupsPanel } from '@/components/crm/dashboard/OverdueFollowupsPanel';
import { OverdueSamplesPanel } from '@/components/crm/dashboard/OverdueSamplesPanel';

const CRMDashboard = () => {
  const navigate = useNavigate();
  const { 
    metrics, 
    isLoading, 
    error 
  } = useCRMDashboardData();

  if (error) {
    return (
      <>
        <Navigation />
        <main className="app-background min-h-screen">
          <div className="container py-6">
            <Card variant="enhanced" className="section-background">
              <CardContent className="pt-6">
                <div className="text-center py-12 text-red-500">
                  <p>Error loading dashboard data: {error.message}</p>
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
      <main className="app-background min-h-screen">
        <div className="container py-6 animate-fade-in">
          {/* Back Navigation */}
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/crm')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to CRM
            </Button>
          </div>

          {/* Header with Metrics */}
          <CRMMetricsHeader metrics={metrics} isLoading={isLoading} />

          {/* Quick Actions Bar */}
          <div className="mt-6">
            <CRMQuickActionsBar />
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid gap-6 lg:grid-cols-5 mt-6">
            {/* Left Sidebar - Navigation */}
            <div className="lg:col-span-1">
              <div className="panel-background p-4 rounded-md">
                <CRMSidebar />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-4">
              {/* Overdue Items Panels */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Overdue Follow-ups Panel */}
                <div>
                  <OverdueFollowupsPanel isLoading={isLoading} />
                </div>

                {/* Overdue Samples Panel */}
                <div>
                  <OverdueSamplesPanel isLoading={isLoading} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CRMDashboard;
