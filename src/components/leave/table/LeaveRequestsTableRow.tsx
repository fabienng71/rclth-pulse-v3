import React from 'react';
import { format } from 'date-fns';
import { Check, X, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LeaveRequest } from '@/types/leave';

interface LeaveRequestsTableRowProps {
  request: LeaveRequest;
  showActions: boolean;
  showCheckboxes: boolean;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onApprove: (request: LeaveRequest) => void;
  onDeny: (request: LeaveRequest) => void;
  onView: (request: LeaveRequest) => void;
  onEdit: (request: LeaveRequest) => void;
  isProcessing: boolean;
}

export const LeaveRequestsTableRow: React.FC<LeaveRequestsTableRowProps> = ({
  request,
  showActions,
  showCheckboxes,
  isSelected,
  onSelect,
  onApprove,
  onDeny,
  onView,
  onEdit,
  isProcessing,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Denied':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Annual':
        return 'bg-blue-100 text-blue-800';
      case 'Sick Leave':
        return 'bg-red-100 text-red-800';
      case 'Business Leave':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const canApprove = request.status === 'Pending';
  const canDeny = request.status === 'Pending' || request.status === 'Approved';

  return (
    <TableRow className={isSelected ? 'bg-muted/50' : ''}>
      {showCheckboxes && (
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            aria-label={`Select request for ${request.user_profile?.full_name}`}
          />
        </TableCell>
      )}
      
      <TableCell className="font-medium">
        <div className="space-y-1">
          <div className="font-medium">
            {request.user_profile?.full_name || 'Unknown User'}
          </div>
          {request.user_profile?.email && (
            <div className="text-xs text-muted-foreground">
              {request.user_profile.email}
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="secondary" className={getLeaveTypeColor(request.leave_type)}>
          {request.leave_type}
        </Badge>
      </TableCell>
      
      <TableCell>{formatDate(request.start_date)}</TableCell>
      
      <TableCell>{formatDate(request.end_date)}</TableCell>
      
      <TableCell className="text-center">
        <Badge variant="outline">{request.duration_days}</Badge>
      </TableCell>
      
      <TableCell>
        <Badge className={getStatusColor(request.status)}>
          {request.status}
        </Badge>
      </TableCell>
      
      <TableCell className="text-sm text-muted-foreground">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {formatDate(request.created_at)}
            </TooltipTrigger>
            <TooltipContent>
              {formatDateTime(request.created_at)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      
      <TableCell className="max-w-xs">
        {request.reason ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-help">
                <div className="truncate text-sm">
                  {request.reason.length > 50 
                    ? `${request.reason.substring(0, 50)}...` 
                    : request.reason}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div className="whitespace-pre-wrap">{request.reason}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-sm text-muted-foreground">No reason provided</span>
        )}
      </TableCell>
      
      {showActions && (
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {canApprove && (
              <Button
                size="sm"
                onClick={() => onApprove(request)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            
            {canDeny && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeny(request)}
                disabled={isProcessing}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(request)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(request)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Request
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};