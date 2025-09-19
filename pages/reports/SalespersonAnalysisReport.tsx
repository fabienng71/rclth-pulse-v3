
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download, FileText, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SalespersonAnalysisFiltersComponent } from '@/components/reports/salesperson-analysis/SalespersonAnalysisFilters';
import { SalespersonAnalysisTable } from '@/components/reports/salesperson-analysis/SalespersonAnalysisTable';
import { SalespersonAnalysisSummary } from '@/components/reports/salesperson-analysis/SalespersonAnalysisSummary';
import { useSalespersonAnalysisData } from '@/hooks/useSalespersonAnalysisData';
import type { SalespersonAnalysisFilters as FiltersType } from '@/hooks/useSalespersonAnalysisData';

const SalespersonAnalysisReport: React.FC = () => {
  const { isAdmin } = useAuthStore();
  const { toast } = useToast();

  // Initialize filters with default values (no pagination)
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const [filters, setFilters] = useState<FiltersType>({
    salesperson_code: '',
    from_date: oneMonthAgo,
    to_date: now,
    sort_field: 'customer_name',
    sort_direction: 'asc',
  });

  const { data, total_count, summary, isLoading, error, exportData, isExporting } = 
    useSalespersonAnalysisData(filters);

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleFiltersChange = (newFilters: Partial<FiltersType>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await exportData(format);
      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
        <main className="container py-6">
          <div className="flex items-center mb-6">
            <Users className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold md:text-3xl">Salesperson Analysis Report</h1>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading data: {error.message}</p>
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
            <Users className="mr-2 h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold md:text-3xl">Salesperson Analysis Report</h1>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={isExporting || data.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting || data.length === 0}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Filters */}
          <SalespersonAnalysisFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Summary Cards */}
          <SalespersonAnalysisSummary
            summary={summary}
            isLoading={isLoading}
          />

          {/* Data Table */}
          <SalespersonAnalysisTable
            data={data}
            totalCount={total_count}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
};

export default SalespersonAnalysisReport;
