
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/authStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShortBusinessReport } from '@/components/reports/short-business/ShortBusinessReport';
import { BarChart3, FileText, TrendingUp, Calendar, Clock } from 'lucide-react';

const ReportingDashboard = () => {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Show loading while authentication is being determined
  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-2xl mb-2">⏳</div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // After loading is complete, check authorization
  if (!user || user.email !== 'fabien@repertoire.co.th') {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authorized, show the reporting dashboard
  return (
    <>
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Executive Reporting Dashboard</h1>
        </div>
        
        <div className="grid gap-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Executive Reports
              </CardTitle>
              <CardDescription>
                Comprehensive business intelligence and performance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="font-semibold">Short Business Report</div>
                    <div className="text-sm text-muted-foreground">Monthly performance overview</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-semibold">Fiscal Year Analysis</div>
                    <div className="text-sm text-muted-foreground">April to March reporting</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-semibold">YTD Performance</div>
                    <div className="text-sm text-muted-foreground">Real-time business metrics</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Access to Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button
                  variant="outline"
                  className="h-16 flex items-center gap-3 justify-start"
                  onClick={() => navigate('/reports/weekly')}
                >
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold">Weekly Report</div>
                    <div className="text-sm text-muted-foreground">Week-over-week performance analysis</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-16 flex items-center gap-3 justify-start"
                  onClick={() => navigate('/reports/mtd')}
                >
                  <Clock className="h-6 w-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold">MTD Report</div>
                    <div className="text-sm text-muted-foreground">Month-to-date performance tracking</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Separator className="my-6" />
          
          {/* Short Business Report */}
          <ShortBusinessReport />
        </div>
      </main>
    </>
  );
};

export default ReportingDashboard;
