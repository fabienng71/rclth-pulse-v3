import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReturnRequestRow } from './ReturnRequestRow';
import { MonthGroup } from '@/utils/monthGrouping';

interface ReturnRequestWithItemCount {
  id: string;
  customer_code: string;
  customers?: {
    customer_name?: string;
    search_name?: string;
  };
  item_count: number;
  return_date: string;
  priority: string;
  status: string;
  full_name?: string;
  created_at: string;
  notes?: string;
}

interface ReturnRequestsTableProps {
  monthGroup: MonthGroup<ReturnRequestWithItemCount>;
  expandedRows: Set<string>;
  itemDetails: Record<string, unknown[]>;
  onToggleExpansion: (requestId: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (request: ReturnRequestWithItemCount) => void;
  getPriorityBadgeClass: (priority: string) => string;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
}

export const ReturnRequestsTable: React.FC<ReturnRequestsTableProps> = ({
  monthGroup,
  expandedRows,
  itemDetails,
  onToggleExpansion,
  onView,
  onEdit,
  onDelete,
  getPriorityBadgeClass,
  getStatusBadgeClass,
  formatDate,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthGroup.requests.map((request) => (
            <ReturnRequestRow
              key={request.id}
              request={request}
              isExpanded={expandedRows.has(request.id)}
              itemDetails={itemDetails}
              onToggleExpansion={onToggleExpansion}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              getPriorityBadgeClass={getPriorityBadgeClass}
              getStatusBadgeClass={getStatusBadgeClass}
              formatDate={formatDate}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};