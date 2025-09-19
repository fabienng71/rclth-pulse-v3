import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { useSortableTable } from '@/hooks/useSortableTable';
import { ProcessedTopNData } from '@/hooks/useTopNCustomersData';
import { formatCurrency } from '@/utils/formatters';

interface VirtualizedTopNTableProps {
  data: ProcessedTopNData;
  height?: number;
  itemSize?: number;
}

type SortableField = 'customer_name' | 'total_turnover' | 'total_margin' | 'total_margin_percent' | string;

interface TableRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    customers: ProcessedTopNData['customers'];
    months: string[];
    formatMonth: (month: string) => string;
  };
}

// Memoized table row component for performance
const TableRow = React.memo<TableRowProps>(({ index, style, data }) => {
  const { customers, months, formatMonth } = data;
  
  // Handle totals row (last row)
  if (index === customers.length) {
    const monthlyTotals = months.reduce((acc, month) => {
      acc[month] = customers.reduce((sum, customer) => sum + (customer.monthly_data[month] || 0), 0);
      return acc;
    }, {} as Record<string, number>);
    
    const grandTotal = customers.reduce((sum, customer) => sum + customer.total_turnover, 0);
    const grandMarginTotal = customers.reduce((sum, customer) => sum + customer.total_margin, 0);

    return (
      <div style={style} className="flex border-b border-t-2 bg-muted/50">
        <div className="w-16 flex-shrink-0 p-2 text-center border-r bg-muted/50 sticky left-0 z-10">
          {/* Empty rank cell */}
        </div>
        <div className="w-48 flex-shrink-0 p-2 border-r bg-muted/50 sticky left-16 z-10 font-bold">
          Monthly Totals
        </div>
        {months.map(month => (
          <div key={month} className="w-32 flex-shrink-0 p-2 text-right border-r font-bold">
            {formatCurrency(monthlyTotals[month] || 0)}
          </div>
        ))}
        <div className="w-32 flex-shrink-0 p-2 text-right font-bold text-lg">
          {formatCurrency(grandTotal)}
        </div>
        <div className="w-32 flex-shrink-0 p-2 text-right font-bold text-lg text-green-700 dark:text-green-400">
          {formatCurrency(grandMarginTotal)}
        </div>
        <div className="w-24 flex-shrink-0 p-2 text-right font-bold text-lg text-green-700 dark:text-green-400">
          {grandTotal > 0 ? ((grandMarginTotal / grandTotal) * 100).toFixed(1) : '0.0'}%
        </div>
      </div>
    );
  }

  const customer = customers[index];
  if (!customer) return <div style={style} />;

  return (
    <div style={style} className="flex border-b hover:bg-muted/20">
      <div className="w-16 flex-shrink-0 p-2 text-center border-r font-medium bg-background sticky left-0 z-10">
        {index + 1}
      </div>
      <div className="w-48 flex-shrink-0 p-2 border-r bg-background sticky left-16 z-10">
        <div className="font-semibold truncate" title={customer.search_name || customer.customer_name}>
          {customer.search_name || customer.customer_name}
        </div>
        <div className="text-sm text-muted-foreground truncate" title={customer.customer_code}>
          {customer.customer_code}
        </div>
      </div>
      {months.map(month => (
        <div key={month} className="w-32 flex-shrink-0 p-2 text-right border-r">
          {formatCurrency(customer.monthly_data[month] || 0)}
        </div>
      ))}
      <div className="w-32 flex-shrink-0 p-2 text-right font-bold">
        {formatCurrency(customer.total_turnover)}
      </div>
      <div className="w-32 flex-shrink-0 p-2 text-right font-bold text-green-700 dark:text-green-400">
        {formatCurrency(customer.total_margin)}
      </div>
      <div className="w-24 flex-shrink-0 p-2 text-right font-bold text-green-700 dark:text-green-400">
        {customer.total_margin_percent.toFixed(1)}%
      </div>
    </div>
  );
}, areEqual);

TableRow.displayName = 'TableRow';

export const VirtualizedTopNTable: React.FC<VirtualizedTopNTableProps> = ({ 
  data, 
  height = 600,
  itemSize = 80
}) => {
  const { sortField, sortDirection, handleSort } = useSortableTable<SortableField>('total_turnover', 'desc');

  const formatMonth = useCallback((month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }, []);

  // Sort customers based on current sort field and direction
  const sortedCustomers = useMemo(() => {
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
        // Sorting by month column
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

  // Calculate total table width
  const tableWidth = useMemo(() => {
    return 64 + 192 + (data.months.length * 128) + 128 + 128 + 96; // rank + name + months + total + margin + margin%
  }, [data.months.length]);

  const itemData = useMemo(() => ({
    customers: sortedCustomers,
    months: data.months,
    formatMonth
  }), [sortedCustomers, data.months, formatMonth]);

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
        <CardTitle>Top N Customers by Monthly Turnover (Virtualized)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Header */}
          <div className="flex border-b-2 bg-muted/50 sticky top-0 z-20" style={{ minWidth: tableWidth }}>
            <div className="w-16 flex-shrink-0 p-2 text-center border-r bg-muted/50 sticky left-0 z-30">
              #
            </div>
            <div className="w-48 flex-shrink-0 p-2 border-r bg-muted/50 sticky left-16 z-30">
              <SortableTableHeader
                field="customer_name"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="text-left"
              >
                Customer
              </SortableTableHeader>
            </div>
            {data.months.map(month => (
              <div key={month} className="w-32 flex-shrink-0 p-2 text-right border-r">
                <SortableTableHeader
                  field={month}
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                >
                  {formatMonth(month)}
                </SortableTableHeader>
              </div>
            ))}
            <div className="w-32 flex-shrink-0 p-2 text-right font-bold">
              <SortableTableHeader
                field="total_turnover"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="text-right"
              >
                Total Turnover
              </SortableTableHeader>
            </div>
            <div className="w-32 flex-shrink-0 p-2 text-right font-bold">
              <SortableTableHeader
                field="total_margin"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="text-right text-green-700 dark:text-green-400"
              >
                Total Margin
              </SortableTableHeader>
            </div>
            <div className="w-24 flex-shrink-0 p-2 text-right font-bold">
              <SortableTableHeader
                field="total_margin_percent"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="text-right text-green-700 dark:text-green-400"
              >
                Margin %
              </SortableTableHeader>
            </div>
          </div>

          {/* Virtualized Content */}
          <div style={{ minWidth: tableWidth }}>
            <List
              height={height}
              itemCount={sortedCustomers.length + 1} // +1 for totals row
              itemSize={itemSize}
              itemData={itemData}
              overscanCount={5}
            >
              {TableRow}
            </List>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};