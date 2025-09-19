
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { SalespersonAnalysisData, SalespersonAnalysisFilters } from '@/hooks/useSalespersonAnalysisData';
import { formatCurrency } from '@/lib/utils';

interface SalespersonAnalysisTableProps {
  data: SalespersonAnalysisData[];
  totalCount: number;
  filters: SalespersonAnalysisFilters;
  onFiltersChange: (filters: Partial<SalespersonAnalysisFilters>) => void;
  isLoading: boolean;
}

export const SalespersonAnalysisTable: React.FC<SalespersonAnalysisTableProps> = ({
  data,
  totalCount,
  filters,
  onFiltersChange,
  isLoading,
}) => {
  // Generate month columns based on date range
  const getMonthColumns = () => {
    const months: string[] = [];
    const start = new Date(filters.from_date);
    const end = new Date(filters.to_date);
    
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    
    while (current <= end) {
      const monthKey = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0');
      months.push(monthKey);
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const monthColumns = getMonthColumns();

  // Calculate totals for each month and grand total
  const calculateTotals = () => {
    const monthTotals: { [key: string]: number } = {};
    let grandTotal = 0;

    // Initialize month totals
    monthColumns.forEach(month => {
      monthTotals[month] = 0;
    });

    // Calculate totals
    data.forEach(customer => {
      monthColumns.forEach(month => {
        const monthAmount = customer.monthly_data[month]?.amount || 0;
        monthTotals[month] += monthAmount;
      });
      grandTotal += customer.total_amount;
    });

    return { monthTotals, grandTotal };
  };

  const { monthTotals, grandTotal } = calculateTotals();

  const handleSort = (field: string) => {
    const newDirection = 
      filters.sort_field === field && filters.sort_direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    onFiltersChange({
      sort_field: field,
      sort_direction: newDirection,
    });
  };

  const getSortIcon = (field: string) => {
    if (filters.sort_field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return filters.sort_direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />;
  };

  const formatMonthHeader = (monthKey: string) => {
    const date = new Date(monthKey + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading customer data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Customer Analysis
          <div className="text-sm text-muted-foreground">
            {totalCount} customers found
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No data found for the selected criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('customer_name')}
                      className="font-medium p-0 h-auto"
                    >
                      Customer {getSortIcon('customer_name')}
                    </Button>
                  </TableHead>
                  {monthColumns.map((month) => (
                    <TableHead key={month} className="text-right">
                      {formatMonthHeader(month)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('total_amount')}
                      className="font-medium p-0 h-auto"
                    >
                      Total {getSortIcon('total_amount')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((customer) => (
                  <TableRow key={customer.customer_code}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{customer.customer_name}</span>
                        <div className="text-sm text-muted-foreground">
                          {customer.customer_code}
                          {customer.search_name && ` • ${customer.search_name}`}
                        </div>
                      </div>
                    </TableCell>
                    {monthColumns.map((month) => (
                      <TableCell key={month} className="text-right">
                        {customer.monthly_data[month] 
                          ? formatCurrency(customer.monthly_data[month].amount)
                          : '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.total_amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">
                    Total
                  </TableCell>
                  {monthColumns.map((month) => (
                    <TableCell key={month} className="text-right font-bold">
                      {formatCurrency(monthTotals[month])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold">
                    {formatCurrency(grandTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
