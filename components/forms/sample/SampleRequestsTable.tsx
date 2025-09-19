
import React from 'react';
import { Table, TableHeader, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { SampleRequest } from '@/services/sample-requests';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { SortDirection } from '@/hooks/useSortableTable';

export type SampleRequestsSortField = 'customer_name' | 'follow_up_date' | 'created_at';

interface SampleRequestsTableProps {
  requests: SampleRequest[];
  formatDate: (dateString: string) => string;
  formatItemDescriptions: (items?: any[]) => string;
  onViewRequest: (id: string) => void;
  onEditRequest: (id: string) => void;
  onDeleteClick: (request: SampleRequest) => void;
  creatorFilter: string;
  sortField: SampleRequestsSortField;
  sortDirection: SortDirection;
  onSort: (field: SampleRequestsSortField) => void;
  showHeader?: boolean;
}

const SampleRequestsTable: React.FC<SampleRequestsTableProps> = ({
  requests,
  formatDate,
  formatItemDescriptions,
  onViewRequest,
  onEditRequest,
  onDeleteClick,
  creatorFilter,
  sortField,
  sortDirection,
  onSort,
  showHeader = true
}) => {
  const isFollowUpOverdue = (followUpDate: string | null) => {
    if (!followUpDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(followUpDate);
    followUp.setHours(0, 0, 0, 0);
    return followUp < today;
  };

  const isFollowUpUpcoming = (followUpDate: string | null) => {
    if (!followUpDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(followUpDate);
    followUp.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    return followUp >= today && followUp <= threeDaysFromNow;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              <SortableTableHeader
                field="customer_name"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                className="w-[240px]"
              >
                Customer
              </SortableTableHeader>
              <SortableTableHeader
                field="follow_up_date"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                className="w-[140px]"
              >
                Follow-up Date
              </SortableTableHeader>
              <SortableTableHeader
                field="created_at"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
                className="w-[120px]"
              >
                Created
              </SortableTableHeader>
              <TableCell className="text-right w-[120px]">Actions</TableCell>
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {requests.length > 0 ? (
            requests.map((request) => {
              const isOverdue = isFollowUpOverdue(request.follow_up_date);
              const isUpcoming = isFollowUpUpcoming(request.follow_up_date);

              return (
                <TableRow 
                  key={request.id} 
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onViewRequest(request.id)}
                >
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      {/* Primary display: search_name with fallback to customer_name (from nested customers object) */}
                      <div className="font-medium text-sm">
                        {request.customers?.search_name || request.customers?.customer_name || request.customer_code}
                      </div>
                      {/* Secondary: Only show customer_name if different from search_name */}
                      {request.customers?.search_name && request.customers?.customer_name && 
                       request.customers.search_name !== request.customers.customer_name && (
                        <div className="text-xs text-muted-foreground">
                          {request.customers.customer_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-3">
                    {request.follow_up_date ? (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${
                          isOverdue ? 'text-red-600 font-medium' : 
                          isUpcoming ? 'text-amber-600 font-medium' : 
                          'text-foreground'
                        }`}>
                          {formatDate(request.follow_up_date)}
                        </span>
                        {isOverdue && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Overdue
                          </span>
                        )}
                        {isUpcoming && !isOverdue && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Soon
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  
                  <TableCell className="py-3">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(request.created_at)}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRequest(request.id);
                        }}
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRequest(request.id);
                        }}
                        title="Edit request"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(request);
                        }}
                        title="Delete request"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No sample requests found for the selected creator.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SampleRequestsTable;
