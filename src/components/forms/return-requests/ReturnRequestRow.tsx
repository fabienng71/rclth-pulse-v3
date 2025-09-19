import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { CleanFragment } from '@/components/ui/clean-fragment';
import { ReturnRequestExpandedDetails } from './ReturnRequestExpandedDetails';

interface ReturnRequestRowProps {
  request: {
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
  };
  isExpanded: boolean;
  itemDetails: Record<string, unknown[]>;
  onToggleExpansion: (requestId: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (request: unknown) => void;
  getPriorityBadgeClass: (priority: string) => string;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
}

export const ReturnRequestRow: React.FC<ReturnRequestRowProps> = ({
  request,
  isExpanded,
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
    <CleanFragment fragmentKey={request.id}>
      <TableRow className="cursor-pointer hover:bg-muted/50">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(request.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div>
            <div className="font-medium">
              {request.customers?.customer_name || request.customer_code}
            </div>
            {request.customers?.search_name && (
              <div className="text-sm text-muted-foreground">
                {request.customers.search_name}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">
            {request.item_count} item{request.item_count !== 1 ? 's' : ''}
          </Badge>
        </TableCell>
        <TableCell>{formatDate(request.return_date)}</TableCell>
        <TableCell>
          <Badge className={getPriorityBadgeClass(request.priority)}>
            {request.priority}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge className={getStatusBadgeClass(request.status)}>
            {request.status}
          </Badge>
        </TableCell>
        <TableCell>{request.full_name || 'Unknown'}</TableCell>
        <TableCell>{formatDate(request.created_at)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(request.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(request.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(request)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow>
          <ReturnRequestExpandedDetails
            request={request}
            itemDetails={itemDetails}
            formatDate={formatDate}
          />
        </TableRow>
      )}
    </CleanFragment>
  );
};