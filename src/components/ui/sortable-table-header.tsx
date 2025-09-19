import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  children,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  className = '',
}) => {
  const getSortIcon = () => {
    if (currentSortKey !== sortKey) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    }

    if (currentSortDirection === 'asc') {
      return <ArrowUp className="h-3 w-3 text-primary" />;
    } else if (currentSortDirection === 'desc') {
      return <ArrowDown className="h-3 w-3 text-primary" />;
    }

    return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <TableHead 
      className={`cursor-pointer hover:bg-background-tertiary transition-colors select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {getSortIcon()}
      </div>
    </TableHead>
  );
};