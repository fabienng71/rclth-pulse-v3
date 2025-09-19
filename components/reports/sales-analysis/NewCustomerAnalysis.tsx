import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { NewCustomerAnalysis as NewCustomerData } from '@/hooks/useSalesAnalytics';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';

interface NewCustomerAnalysisProps {
  data: NewCustomerData[];
  isLoading: boolean;
  selectedSalesperson: string;
}

export const NewCustomerAnalysis: React.FC<NewCustomerAnalysisProps> = ({
  data,
  isLoading,
  selectedSalesperson,
}) => {
  // Enhanced sorting with the sortable table hook
  const { sortField, sortDirection, handleSort, sortData } = useSortableTable<keyof NewCustomerData>('first_week_value', 'desc');
  
  // Sort the data
  const sortedData = sortData(data || []);
  const getPotentialBadge = (potential: string) => {
    switch (potential) {
      case 'HIGH_POTENTIAL':
        return <Badge variant="default" className="bg-soft-primary text-primary border-primary/20">High Potential</Badge>;
      case 'MEDIUM_POTENTIAL':
        return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">Medium Potential</Badge>;
      case 'LOW_POTENTIAL':
        return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Low Potential</Badge>;
      default:
        return <Badge variant="outline">Micro Potential</Badge>;
    }
  };

  const getEngagementBadge = (engagement: string) => {
    switch (engagement) {
      case 'WELL_ENGAGED':
        return <Badge variant="default" className="bg-soft-primary text-primary border-primary/20">Well Engaged</Badge>;
      case 'MODERATELY_ENGAGED':
        return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">Moderately Engaged</Badge>;
      case 'MINIMALLY_ENGAGED':
        return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Minimally Engaged</Badge>;
      default:
        return <Badge variant="destructive">Not Engaged</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            New Customer Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading new customer analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          New Customer Analysis
          <Badge variant="outline" className="ml-2">
            {data.length} new customers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">High Potential</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {data.filter(c => c.customer_potential === 'HIGH_POTENTIAL').length}
            </p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">Total First Week Value</span>
            </div>
            <p className="text-2xl font-bold text-secondary">
              {Math.round(data.reduce((sum, c) => sum + (c.first_week_value || 0), 0)).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Avg Transaction Count</span>
            </div>
            <p className="text-2xl font-bold text-warning">
              {data.length > 0 ? (data.reduce((sum, c) => sum + c.transaction_count, 0) / data.length).toFixed(1) : 0}
            </p>
          </div>
        </div>

        {/* Customer Table */}
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-background-secondary">
                  <SortableTableHeader
                    sortKey="customer_name"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Customer
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="first_week_value"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    First Week Value
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="transaction_count"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Transactions
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="avg_order_value"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Avg Order Value
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="customer_potential"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Potential
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="onboarding_status"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Engagement
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="suggested_action"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Suggested Action
                  </SortableTableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((customer) => (
                  <TableRow key={customer.customer_code} className="hover:bg-background-secondary">
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{customer.customer_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {Math.round(customer.first_week_value || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{customer.transaction_count}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {Math.round(customer.avg_order_value || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getPotentialBadge(customer.customer_potential)}
                    </TableCell>
                    <TableCell>
                      {getEngagementBadge(customer.onboarding_status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {customer.suggested_action}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No new customers found for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};