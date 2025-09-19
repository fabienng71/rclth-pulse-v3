import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WeeklyReportProvider } from '@/contexts/WeeklyReportContext';
import { WeeklyFilters } from '@/components/reports/weekly/WeeklyFilters';
import { WeeklySummary } from '@/components/reports/weekly/WeeklySummary';
import { WeeklyTabsView } from '@/components/reports/weekly/WeeklyTabsView';

const WeeklyReport = () => {
  const navigate = useNavigate();

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
            <h1 className="text-2xl font-bold md:text-3xl">Weekly Sales Report</h1>
          </div>
        </div>

        <WeeklyReportProvider>
          <div className="space-y-6">
            <WeeklyFilters />
            <WeeklySummary />
            <WeeklyTabsView />
          </div>
        </WeeklyReportProvider>
      </main>
    </div>
  );
};

export default WeeklyReport;