import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface LeaveRequestsTableHeaderProps {
  showActions: boolean;
  showCheckboxes: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const LeaveRequestsTableHeader: React.FC<LeaveRequestsTableHeaderProps> = ({
  showActions,
  showCheckboxes,
  sortField,
  sortDirection,
  onSort,
  isAllSelected,
  isPartiallySelected,
  onSelectAll,
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="h-8 p-0 font-medium hover:bg-transparent"
    >
      {children}
      {getSortIcon(field)}
    </Button>
  );

  return (
    <TableHeader>
      <TableRow>
        {showCheckboxes && (
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onCheckedChange={onSelectAll}
              aria-label="Select all"
            />
          </TableHead>
        )}
        
        <TableHead>
          <SortButton field="user_profile.full_name">
            Employee
          </SortButton>
        </TableHead>
        
        <TableHead>
          <SortButton field="leave_type">
            Type
          </SortButton>
        </TableHead>
        
        <TableHead>
          <SortButton field="start_date">
            Start Date
          </SortButton>
        </TableHead>
        
        <TableHead>
          <SortButton field="end_date">
            End Date
          </SortButton>
        </TableHead>
        
        <TableHead className="text-center">
          <SortButton field="duration_days">
            Days
          </SortButton>
        </TableHead>
        
        <TableHead>
          <SortButton field="status">
            Status
          </SortButton>
        </TableHead>
        
        <TableHead>
          <SortButton field="created_at">
            Requested
          </SortButton>
        </TableHead>
        
        <TableHead>Reason</TableHead>
        
        {showActions && (
          <TableHead className="text-right">Actions</TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};