import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeeklyReportFilters } from '@/contexts/WeeklyReportContext';
import { useWeeklyReportData } from '@/hooks/useWeeklyReportData';
import { WeeklyProgressTable } from '@/components/reports/weekly/WeeklyProgressTable';
import { WeeklyTopCustomersTable } from '@/components/reports/weekly/WeeklyTopCustomersTable';
import { WeeklyCustomerList } from '@/components/reports/weekly/WeeklyCustomerList';
import { WeeklyNewCustomers } from '@/components/reports/weekly/WeeklyNewCustomers';

export const WeeklyTabsView: React.FC = () => {
  const { filters } = useWeeklyReportFilters();
  const { summary, progress, topCustomers, customerList, error } = useWeeklyReportData(filters);

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold text-destructive">Error Loading Data</h3>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="weekly" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="weekly">Weekly View</TabsTrigger>
        <TabsTrigger value="customers">Customer List</TabsTrigger>
      </TabsList>
      
      <TabsContent value="weekly" className="space-y-6">
        <WeeklyProgressTable 
          year={filters.year}
          week={filters.week}
          selectedSalesperson={filters.salesperson}
          includeCreditMemo={filters.includeCreditMemo}
          includeServices={filters.includeServices}
        />

        <WeeklyTopCustomersTable 
          year={filters.year}
          week={filters.week}
          selectedSalesperson={filters.salesperson}
          includeCreditMemo={filters.includeCreditMemo}
          includeServices={filters.includeServices}
        />

        <WeeklyNewCustomers summary={summary} />
      </TabsContent>
      
      <TabsContent value="customers" className="space-y-6">
        <WeeklyCustomerList 
          year={filters.year}
          week={filters.week}
          selectedSalesperson={filters.salesperson}
          includeCreditMemo={filters.includeCreditMemo}
          includeServices={filters.includeServices}
        />
      </TabsContent>
    </Tabs>
  );
};