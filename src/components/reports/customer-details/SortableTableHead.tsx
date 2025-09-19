
import { TableHead } from '@/components/ui/table';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { SortDirection, SortField } from '@/hooks/useItemPurchaseSorting';

interface SortableTableHeadProps {
  field: SortField;
  currentSortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

export const SortableTableHead = ({
  field,
  currentSortField,
  sortDirection,
  onSort,
  children,
  className = "",
  align = "left"
}: SortableTableHeadProps) => {
  const getSortIcon = () => {
    if (currentSortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 ${className}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : ''}`}>
        {children}
        {getSortIcon()}
      </div>
    </TableHead>
  );
};
