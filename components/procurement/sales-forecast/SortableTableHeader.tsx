
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SortField, SortDirection } from '@/hooks/useSortableCollaborativeTable';

interface SortableTableHeaderProps {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
}

export const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  field,
  sortField,
  sortDirection,
  onSort,
  children,
  className
}) => {
  const isActive = sortField === field;
  
  return (
    <th 
      className={`text-left p-2 font-medium cursor-pointer hover:bg-muted/50 select-none ${className || ''}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive && (
          sortDirection === 'asc' 
            ? <ArrowUp className="h-3 w-3" />
            : <ArrowDown className="h-3 w-3" />
        )}
      </div>
    </th>
  );
};
