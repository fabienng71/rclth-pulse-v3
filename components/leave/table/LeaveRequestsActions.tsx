import React from 'react';
import { Download, Check, X, Clock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

interface LeaveRequestsActionsProps {
  showActions: boolean;
  selectedRequests: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onBulkApprove: () => void;
  onBulkDeny: () => void;
  onExportToCSV: () => void;
  onExportToPDF: () => void;
  totalRequests: number;
  filteredRequests: number;
  isProcessing: boolean;
}

export const LeaveRequestsActions: React.FC<LeaveRequestsActionsProps> = ({
  showActions,
  selectedRequests,
  onSelectAll,
  onBulkApprove,
  onBulkDeny,
  onExportToCSV,
  onExportToPDF,
  totalRequests,
  filteredRequests,
  isProcessing,
}) => {
  const hasSelectedRequests = selectedRequests.size > 0;
  const isAllSelected = selectedRequests.size === filteredRequests && filteredRequests > 0;
  const isPartiallySelected = selectedRequests.size > 0 && selectedRequests.size < filteredRequests;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showActions && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onCheckedChange={onSelectAll}
              aria-label="Select all requests"
            />
            <span className="text-sm text-muted-foreground">
              {hasSelectedRequests
                ? `${selectedRequests.size} selected`
                : 'Select all'}
            </span>
          </div>
        )}

        {hasSelectedRequests && showActions && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onBulkApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-1 h-3 w-3" />
              Approve ({selectedRequests.size})
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onBulkDeny}
              disabled={isProcessing}
            >
              <X className="mr-1 h-3 w-3" />
              Deny ({selectedRequests.size})
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportToPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </div>
  );
};