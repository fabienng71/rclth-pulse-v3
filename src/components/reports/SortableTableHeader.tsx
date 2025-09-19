
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { TableHead } from '../ui/table';
import { SortDirection } from '@/hooks/useSortableTable';

interface SortableTableHeaderProps<T extends string> {
  field: T;
  currentSortField: T;
  sortDirection: SortDirection;
  onSort: (field: T) => void;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center'; // Added 'center' option
}

export function SortableTableHeader<T extends string>({
  field,
  currentSortField,
  sortDirection,
  onSort,
  children,
  className = "",
  align = "left"
}: SortableTableHeaderProps<T>) {
  const getSortIcon = () => {
    if (currentSortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
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
}
