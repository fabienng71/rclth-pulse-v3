import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMonthlyReport, MonthlyReportOptions } from '@/hooks/useMonthlyReport';
import { MonthlyReportFilters } from '@/components/reports/monthly/MonthlyReportFilters';
import { MonthlyReportSummaryCards } from '@/components/reports/monthly/MonthlyReportSummaryCards';
import { MonthlyReportTable } from '@/components/reports/monthly/MonthlyReportTable';
import { useAuthStore } from '@/stores/authStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const MonthlyReport = () => {
  console.log('=== MONTHLY REPORT: Component loaded ===');
  const navigate = useNavigate();
  const { isAdmin, user, profile } = useAuthStore();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedSalesperson, setSelectedSalesperson] = useState(() => {
    // Initialize based on user type to prevent race condition
    return isAdmin ? 'all' : (profile?.spp_code || 'all');
  });
  const [reportOptions, setReportOptions] = useState<MonthlyReportOptions>({
    includeCreditMemos: true,
  });

  // Update selectedSalesperson when profile loads for non-admin users
  useEffect(() => {
    if (!isAdmin && profile?.spp_code && selectedSalesperson === 'all') {
      setSelectedSalesperson(profile.spp_code);
    }
  }, [isAdmin, profile?.spp_code, selectedSalesperson]);

  const { data, summary, isLoading, error, debugInfo } = useMonthlyReport(
    selectedYear, 
    selectedMonth, 
    selectedSalesperson,
    reportOptions
  );

  // Show debug information for non-admin users without salesperson code
  const showDebugInfo = !isAdmin && !profile?.spp_code;

  if (error) {
    return (
      <div className="min-h-screen bg-background-primary transition-smooth">
        <Navigation />
        <main className="container py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">Error loading monthly report data</h2>
            <p className="text-muted-foreground mt-2">{error.message}</p>
            {showDebugInfo && (
              <Alert className="mt-4 max-w-lg mx-auto">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Debug: No salesperson code found in your profile. Please contact your administrator to set up your salesperson code.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/reports')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Monthly Customer Report</h1>
        </div>

        {/* Debug information for troubleshooting */}
        {showDebugInfo && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Debug Information:</strong></p>
                <p>• User Type: {isAdmin ? 'Admin' : 'Non-admin'}</p>
                <p>• Profile Salesperson Code: {profile?.spp_code || 'Not set'}</p>
                <p>• User ID: {user?.id || 'Not set'}</p>
                <p>• Data Available: {debugInfo?.hasData ? 'Yes' : 'No'}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  If you don't see data, please contact your administrator to assign a salesperson code to your profile.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <MonthlyReportFilters
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSalesperson={selectedSalesperson}
          includeCreditMemos={reportOptions.includeCreditMemos}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onSalespersonChange={setSelectedSalesperson}
          onCreditMemosToggle={(include) => setReportOptions(prev => ({ ...prev, includeCreditMemos: include }))}
          isLoading={isLoading}
        />

        <MonthlyReportSummaryCards 
          summary={summary} 
          isLoading={isLoading} 
          selectedSalesperson={selectedSalesperson}
          includeCreditMemos={reportOptions.includeCreditMemos}
        />

        <MonthlyReportTable
          data={data}
          isLoading={isLoading}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSalesperson={selectedSalesperson}
          includeCreditMemos={reportOptions.includeCreditMemos}
        />
      </main>
    </div>
  );
};

export default MonthlyReport;