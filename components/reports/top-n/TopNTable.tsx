
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { useSortableTable } from '@/hooks/useSortableTable';
import { ProcessedTopNData } from '@/hooks/useTopNCustomersData';
import { formatCurrency } from '@/utils/formatters';

interface TopNTableProps {
  data: ProcessedTopNData;
}

type SortableField = 'customer_name' | 'total_turnover' | 'total_margin' | 'total_margin_percent' | string; // Allow month strings

export const TopNTable: React.FC<TopNTableProps> = ({ data }) => {
  const { sortField, sortDirection, handleSort } = useSortableTable<SortableField>('total_turnover', 'desc');

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Sort customers based on current sort field and direction
  const sortedCustomers = React.useMemo(() => {
    if (!data.customers.length) return [];

    return [...data.customers].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'customer_name') {
        aValue = a.search_name || a.customer_name;
        bValue = b.search_name || b.customer_name;
      } else if (sortField === 'total_turnover') {
        aValue = a.total_turnover;
        bValue = b.total_turnover;
      } else if (sortField === 'total_margin') {
        aValue = a.total_margin;
        bValue = b.total_margin;
      } else if (sortField === 'total_margin_percent') {
        aValue = a.total_margin_percent;
        bValue = b.total_margin_percent;
      } else {
        // Sorting by month column (turnover)
        aValue = a.monthly_data[sortField] || 0;
        bValue = b.monthly_data[sortField] || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (aValue as number) - (bValue as number);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });
  }, [data.customers, sortField, sortDirection]);

  if (!data.customers.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No data available for the selected criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top N Customers by Monthly Turnover</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 w-16 text-center">
                  #
                </TableHead>
                <SortableTableHeader
                  field="customer_name"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="sticky left-16 bg-background z-10 min-w-[200px]"
                >
                  Customer
                </SortableTableHeader>
                {data.months.map(month => (
                  <SortableTableHeader
                    key={month}
                    field={month}
                    currentSortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    className="min-w-[120px]"
                    align="right"
                  >
                    {formatMonth(month)}
                  </SortableTableHeader>
                ))}
                <SortableTableHeader
                  field="total_turnover"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="font-bold min-w-[120px]"
                  align="right"
                >
                  Total Turnover
                </SortableTableHeader>
                <SortableTableHeader
                  field="total_margin"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="font-bold min-w-[120px] text-green-700 dark:text-green-400"
                  align="right"
                >
                  Total Margin
                </SortableTableHeader>
                <SortableTableHeader
                  field="total_margin_percent"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="font-bold min-w-[100px] text-green-700 dark:text-green-400"
                  align="right"
                >
                  Margin %
                </SortableTableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer, index) => (
                <TableRow key={customer.customer_code}>
                  <TableCell className="sticky left-0 bg-background z-10 text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="sticky left-16 bg-background z-10 font-medium">
                    <div>
                      <div className="font-semibold">{customer.search_name || customer.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{customer.customer_code}</div>
                    </div>
                  </TableCell>
                  {data.months.map(month => (
                    <TableCell key={month} className="text-right">
                      {formatCurrency(customer.monthly_data[month] || 0)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-bold">
                    {formatCurrency(customer.total_turnover)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-700 dark:text-green-400">
                    {formatCurrency(customer.total_margin)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-700 dark:text-green-400">
                    {customer.total_margin_percent.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
              {/* Monthly totals row */}
              <TableRow className="border-t-2 bg-muted/50">
                <TableCell className="sticky left-0 bg-muted/50 z-10">
                </TableCell>
                <TableCell className="sticky left-16 bg-muted/50 z-10 font-bold">
                  Monthly Totals
                </TableCell>
                {data.months.map(month => (
                  <TableCell key={month} className="text-right font-bold">
                    {formatCurrency(data.monthlyTotals[month] || 0)}
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold text-lg">
                  {formatCurrency(data.grandTotal)}
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-green-700 dark:text-green-400">
                  {formatCurrency(data.grandMarginTotal)}
                </TableCell>
                <TableCell className="text-right font-bold text-lg text-green-700 dark:text-green-400">
                  {data.grandTotal > 0 ? ((data.grandMarginTotal / data.grandTotal) * 100).toFixed(1) : '0.0'}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
