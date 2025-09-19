import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';
import { MonthlyReportData } from '@/hooks/useMonthlyReport';
import { useSortableTable } from '@/hooks/useSortableTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ChevronDown, ChevronRight } from 'lucide-react';
import { CustomerProductDetailsRow } from './CustomerProductDetailsRow';

interface MonthlyReportTableProps {
  data: MonthlyReportData[];
  isLoading: boolean;
  selectedYear: number;
  selectedMonth: number;
  selectedSalesperson: string;
  includeCreditMemos: boolean;
}

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const MonthlyReportTable: React.FC<MonthlyReportTableProps> = ({
  data,
  isLoading,
  selectedYear,
  selectedMonth,
  selectedSalesperson,
  includeCreditMemos,
}) => {
  const { sortField, sortDirection, handleSort, sortData } = useSortableTable<keyof MonthlyReportData>('total_turnover', 'desc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (customerCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(customerCode)) {
      newExpandedRows.delete(customerCode);
    } else {
      newExpandedRows.add(customerCode);
    }
    setExpandedRows(newExpandedRows);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  const sortedData = sortData(data);
  const monthName = months.find(m => m.value === selectedMonth)?.label || '';
  const salespersonInfo = selectedSalesperson === 'all' 
    ? ' (All Salespersons)' 
    : ` (${selectedSalesperson})`;

  // Calculate totals for footer
  const totals = data.reduce((acc, row) => ({
    total_turnover: acc.total_turnover + row.total_turnover,
    total_cost: acc.total_cost + row.total_cost,
    total_margin: acc.total_margin + row.total_margin,
    credit_memo_amount: acc.credit_memo_amount + row.credit_memo_amount,
    net_turnover: acc.net_turnover + row.net_turnover,
    net_margin: acc.net_margin + row.net_margin,
    transaction_count: acc.transaction_count + row.transaction_count,
  }), {
    total_turnover: 0,
    total_cost: 0,
    total_margin: 0,
    credit_memo_amount: 0,
    net_turnover: 0,
    net_margin: 0,
    transaction_count: 0,
  });

  const avgMarginPercent = totals.total_turnover > 0 
    ? (totals.total_margin / totals.total_turnover) * 100 
    : 0;
  const netMarginPercent = totals.net_turnover > 0 
    ? (totals.net_margin / totals.net_turnover) * 100 
    : 0;

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle>
          Monthly Customer Report - {monthName} {selectedYear}{salespersonInfo}
          {!includeCreditMemos && <span className="ml-2 text-sm text-muted-foreground">(Excluding Credit Memos)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading monthly report data...</div>
        ) : data.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              No customer transaction data found for the selected period.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="w-[32px] px-2 py-2"></TableCell>
                  <SortableTableHeader
                    sortKey="customer_name"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Customer
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="total_turnover"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-center"
                  >
                    Turnover
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="margin_percent"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                    className="text-center"
                  >
                    Margin %
                  </SortableTableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row) => {
                  const isExpanded = expandedRows.has(row.customer_code);
                  return (
                    <React.Fragment key={row.customer_code}>
                      {/* Main Customer Row */}
                      <TableRow className="hover:bg-muted/40 transition-all duration-200">
                        {/* Expand Button */}
                        <TableCell className="w-[32px] px-2 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => toggleRowExpansion(row.customer_code, e)}
                            className="h-6 w-6 p-0 hover:bg-muted"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                        </TableCell>
                        
                        {/* Customer Info */}
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{row.search_name || row.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{row.customer_code}</div>
                          </div>
                        </TableCell>
                        
                        {/* Turnover */}
                        <TableCell className="text-center font-mono">
                          {formatCurrency(row.total_turnover)}
                        </TableCell>
                        
                        {/* Margin % */}
                        <TableCell className="text-center font-medium">
                          <span className={`px-2 py-1 rounded text-sm ${
                            row.margin_percent >= 20 ? 'bg-green-100 text-green-800' :
                            row.margin_percent >= 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {formatPercent(row.margin_percent)}
                          </span>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Product Details Row */}
                      {isExpanded && (
                        <CustomerProductDetailsRow
                          customerCode={row.customer_code}
                          searchName={row.search_name || row.customer_name}
                          year={selectedYear}
                          month={selectedMonth}
                          selectedSalesperson={selectedSalesperson}
                          includeCreditMemos={includeCreditMemos}
                          colSpan={4} // Expand + Customer + Turnover + Margin %
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};