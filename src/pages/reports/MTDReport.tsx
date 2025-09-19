
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMTDData, MTDDataOptions } from '@/hooks/useMTDData';
import { MTDPeriodSelector } from '@/components/reports/mtd/MTDPeriodSelector';
import { MTDSummaryCards } from '@/components/reports/mtd/MTDSummaryCards';
import { MTDDataTable } from '@/components/reports/mtd/MTDDataTable';
import { MTDProjectionCard } from '@/components/reports/mtd/MTDProjectionCard';
import { MTDTargetManagement } from '@/components/reports/mtd/MTDTargetManagement';
import { MTDExportControls } from '@/components/reports/mtd/MTDExportControls';
import { MTDSkeletonLoader } from '@/components/reports/mtd/MTDSkeletonLoader';
import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const MTDReport = () => {
  const navigate = useNavigate();
  const { isAdmin, user, profile } = useAuthStore();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedSalesperson, setSelectedSalesperson] = useState(() => {
    // Initialize based on user type to prevent race condition
    return isAdmin ? 'all' : (profile?.spp_code || 'all');
  });
  const [dataOptions, setDataOptions] = useState<MTDDataOptions>({
    includeDeliveryFees: false,
    includeCreditMemos: true,
  });

  // Update selectedSalesperson when profile loads for non-admin users
  useEffect(() => {
    if (!isAdmin && profile?.spp_code && selectedSalesperson === 'all') {
      setSelectedSalesperson(profile.spp_code);
    }
  }, [isAdmin, profile?.spp_code, selectedSalesperson]);

  const { data, summary, isLoading, error, debugInfo } = useMTDData(
    selectedYear, 
    selectedMonth, 
    selectedSalesperson,
    dataOptions
  );

  // Fetch holidays for the projection calculation
  const { data: holidayData } = useQuery({
    queryKey: ['holidays', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_holidays')
        .select('holiday_date')
        .gte('holiday_date', `${selectedYear}-01-01`)
        .lte('holiday_date', `${selectedYear}-12-31`);
      
      if (error) throw error;
      return data?.map(h => new Date(h.holiday_date)) || [];
    },
  });

  // Show debug information for non-admin users without salesperson code
  const showDebugInfo = !isAdmin && !profile?.spp_code;

  if (error) {
    return (
      <div className="min-h-screen bg-background-primary transition-smooth">
        <Navigation />
        <main className="container py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">Error loading MTD data</h2>
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

  // Show skeleton loader during initial load
  if (isLoading && !data) {
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
            <h1 className="text-2xl font-bold md:text-3xl">Month-to-Date (MTD) Sales Report</h1>
          </div>
          <MTDSkeletonLoader />
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
          <h1 className="text-2xl font-bold md:text-3xl">Month-to-Date (MTD) Sales Report</h1>
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

        <MTDPeriodSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSalesperson={selectedSalesperson}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onSalespersonChange={setSelectedSalesperson}
          summary={summary}
          holidays={holidayData}
          dataOptions={dataOptions}
          onDataOptionsChange={setDataOptions}
          isLoading={isLoading}
        />

        <MTDProjectionCard
          summary={summary}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSalesperson={selectedSalesperson}
          isLoading={isLoading}
        />

        <MTDTargetManagement
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSalesperson={selectedSalesperson}
          currentSalesAmount={summary.current_year_total}
          isLoading={isLoading}
        />

        <MTDSummaryCards 
          summary={summary} 
          isLoading={isLoading} 
          selectedSalesperson={selectedSalesperson}
        />


        <MTDDataTable
          data={data}
          summary={summary}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSalesperson={selectedSalesperson}
          isLoading={isLoading}
        />

        <MTDExportControls
          data={data}
          summary={summary}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          selectedSalesperson={selectedSalesperson}
          options={dataOptions}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default MTDReport;
