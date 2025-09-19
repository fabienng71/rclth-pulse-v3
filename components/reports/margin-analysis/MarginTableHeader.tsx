
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortDirection, SortField } from '@/hooks/useMarginTableSort';

interface MarginTableHeaderProps {
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export const MarginTableHeader = ({
  field,
  currentSortField,
  sortDirection,
  onSort,
  children,
  className = '',
  align = 'left',
}: MarginTableHeaderProps) => {
  const isActive = currentSortField === field;

  const getSortIcon = () => {
    if (!isActive) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 ml-1" /> : 
      <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const getAlignmentClass = () => {
    switch(align) {
      case 'right': return 'justify-end';
      case 'center': return 'justify-center';
      default: return 'justify-start';
    }
  };

  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 ${className}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center ${getAlignmentClass()}`}>
        {children}
        {getSortIcon()}
      </div>
    </TableHead>
  );
};
