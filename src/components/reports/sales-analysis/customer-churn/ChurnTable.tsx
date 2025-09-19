import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';
import { CustomerChurnAnalysis } from '@/hooks/useSalesAnalytics';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';
import { ChurnTableRow } from './ChurnTableRow';

interface ChurnTableProps {
  data: CustomerChurnAnalysis[];
  sortField: keyof CustomerChurnAnalysis;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof CustomerChurnAnalysis) => void;
}

export const ChurnTable: React.FC<ChurnTableProps> = ({
  data,
  sortField,
  sortDirection,
  handleSort,
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No customers match the selected filters</p>
      </div>
    );
  }

  return (
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
              sortKey="churn_status"
              currentSortKey={sortField}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              Status
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="risk_score"
              currentSortKey={sortField}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              Risk Score
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="historical_value"
              currentSortKey={sortField}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              Historical Value
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="recent_value"
              currentSortKey={sortField}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              Recent Value
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="value_trend"
              currentSortKey={sortField}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              Trend
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="weeks_since_last_order"
              currentSortKey={sortField}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              Last Order
            </SortableTableHeader>
            <SortableTableHeader
              sortKey="recovery_priority"
              currentSortKey={sortField}
              currentSortDirection={sortDirection}
              onSort={handleSort}
            >
              Priority
            </SortableTableHeader>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((customer) => (
            <ChurnTableRow key={customer.customer_code} customer={customer} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};