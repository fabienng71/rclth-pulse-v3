
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useWeeklyData } from '@/hooks/useWeeklyData';
import { useEnhancedWeeklyData } from '@/hooks/useEnhancedWeeklyData';
import { WeeklyPeriodSelector } from '@/components/reports/weekly/WeeklyPeriodSelector';
import { WeeklySummaryCards } from '@/components/reports/weekly/WeeklySummaryCards';
import { EnhancedWeeklySummaryCards } from '@/components/reports/weekly/EnhancedWeeklySummaryCards';
import { CompactWeeklySummaryCards } from '@/components/reports/weekly/CompactWeeklySummaryCards';
import { WeeklyNewCustomers } from '@/components/reports/weekly/WeeklyNewCustomers';
import { WeeklyProgressTable } from '@/components/reports/weekly/WeeklyProgressTable';
import { WeeklyTopCustomersTable } from '@/components/reports/weekly/WeeklyTopCustomersTable';
import { WeeklyCustomerList } from '@/components/reports/weekly/WeeklyCustomerList';
import { useAuthStore } from '@/stores/authStore';
import { useWeekData } from '@/hooks/useWeekData';
import { ensureWeeksPopulated } from '@/utils/weekUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const WeeklyReport = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthStore();
  const { currentWeek: defaultWeek, currentYear: defaultYear, isLoading: weekDataLoading } = useWeekData();
  
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const [selectedSalesperson, setSelectedSalesperson] = useState('all');


  // Update selected values when week data loads
  useEffect(() => {
    if (!weekDataLoading && defaultWeek && defaultYear) {
      setSelectedYear(defaultYear);
      setSelectedWeek(defaultWeek);
    }
  }, [weekDataLoading, defaultWeek, defaultYear]);

  // Ensure weeks table is populated for the selected year
  useEffect(() => {
    const initializeWeeksData = async () => {
      console.log('[WeeklyReport] Initializing weeks data for year:', selectedYear);
      
      // Ensure weeks are populated for the selected year
      await ensureWeeksPopulated(selectedYear);
      
      console.log('[WeeklyReport] Weeks data initialization complete');
    };

    if (selectedYear) {
      initializeWeeksData();
    }
  }, [selectedYear]);

  const { data, summary, isLoading, error } = useWeeklyData(selectedYear, selectedWeek, selectedSalesperson);
  
  // Enhanced analytics data
  const {
    summary: enhancedSummary,
    isLoading: isEnhancedLoading,
    error: enhancedError,
    refreshAnalytics,
  } = useEnhancedWeeklyData(selectedYear, selectedWeek, selectedSalesperson, true);

  const handleRefreshAnalytics = async () => {
    try {
      toast.promise(refreshAnalytics(), {
        loading: 'Refreshing analytics data...',
        success: 'Analytics refreshed successfully',
        error: 'Failed to refresh analytics'
      });
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    }
  };

  if (error || enhancedError) {
    return (
      <div className="min-h-screen bg-background-primary transition-smooth">
        <Navigation />
        <main className="container py-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">Error loading weekly data</h2>
            <p className="text-muted-foreground mt-2">{(error || enhancedError)?.message}</p>
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
              onClick={() => navigate('/reporting')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reporting Dashboard
            </Button>
            <h1 className="text-2xl font-bold md:text-3xl">Enhanced Weekly Sales Report</h1>
          </div>
          <Button
            variant="outline"
            onClick={handleRefreshAnalytics}
            disabled={isEnhancedLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isEnhancedLoading ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </Button>
        </div>

        <div className="space-y-6">
          <WeeklyPeriodSelector
            selectedYear={selectedYear}
            selectedWeek={selectedWeek}
            selectedSalesperson={selectedSalesperson}
            onYearChange={setSelectedYear}
            onWeekChange={setSelectedWeek}
            onSalespersonChange={setSelectedSalesperson}
            summary={summary}
          />

          {/* Compact Summary Cards */}
          {enhancedSummary ? (
            <CompactWeeklySummaryCards 
              summary={enhancedSummary} 
              isLoading={isEnhancedLoading} 
            />
          ) : (
            <WeeklySummaryCards summary={summary} isLoading={isLoading} />
          )}

          {/* Tabbed Analytics View */}
          <Tabs defaultValue="weekly" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              <TabsTrigger value="customers">Customer List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="space-y-6">
              <WeeklyProgressTable 
                year={selectedYear}
                week={selectedWeek}
                selectedSalesperson={selectedSalesperson}
              />

              <WeeklyTopCustomersTable 
                year={selectedYear}
                week={selectedWeek}
                selectedSalesperson={selectedSalesperson}
              />

              <WeeklyNewCustomers summary={summary} />
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-6">
              <WeeklyCustomerList 
                year={selectedYear}
                week={selectedWeek}
                selectedSalesperson={selectedSalesperson}
                includeCreditMemo={includeCreditMemo}
                includeServices={includeServices}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default WeeklyReport;
