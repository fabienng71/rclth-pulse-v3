import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Download } from 'lucide-react';
import { CustomerChurnAnalysis as CustomerChurnData } from '@/hooks/useSalesAnalytics';
import { 
  ChurnFilters, 
  ChurnSummaryStats, 
  ChurnTable, 
  RecommendedActions, 
  useCustomerChurnFilters, 
  exportChurnData 
} from './customer-churn';

interface CustomerChurnAnalysisProps {
  data: CustomerChurnData[];
  isLoading: boolean;
  selectedSalesperson: string;
}

export const CustomerChurnAnalysis: React.FC<CustomerChurnAnalysisProps> = ({
  data,
  isLoading,
  selectedSalesperson,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredAndSortedData,
  } = useCustomerChurnFilters(data);

  const handleExportData = () => {
    exportChurnData(filteredAndSortedData);
  };

  if (isLoading) {
    return (
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Customer Churn Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading customer churn analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Customer Churn Analysis
            <Badge variant="outline" className="ml-2">
              {filteredAndSortedData.length} customers
            </Badge>
          </CardTitle>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChurnFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        <ChurnSummaryStats data={data} />

        <ChurnTable
          data={filteredAndSortedData}
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
        />

        <RecommendedActions data={filteredAndSortedData} />
      </CardContent>
    </Card>
  );
};