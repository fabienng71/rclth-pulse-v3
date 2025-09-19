
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { SortDirection } from '@/hooks/useSortableTable';

interface ActivityTableHeaderProps {
  sortField?: string;
  sortDirection?: SortDirection;
  onSort?: (field: string) => void;
}

export const ActivityTableHeader: React.FC<ActivityTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort
}) => {
  const renderSortableHeader = (title: string, field: string) => {
    if (onSort && sortField && sortDirection) {
      return (
        <SortableTableHeader
          field={field}
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={() => onSort(field)}
        >
          {title}
        </SortableTableHeader>
      );
    }
    return <TableHead>{title}</TableHead>;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[32px] px-2"></TableHead>
        <TableHead className="w-[120px] px-3">{renderSortableHeader('Type', 'activity_type')}</TableHead>
        <TableHead className="flex-1 min-w-[200px] px-3">{renderSortableHeader('Entity', 'entity')}</TableHead>
        <TableHead className="w-[120px] px-3 hidden sm:table-cell">{renderSortableHeader('Date', 'activity_date')}</TableHead>
        <TableHead className="w-[140px] px-3 hidden md:table-cell">{renderSortableHeader('Salesperson', 'salesperson_name')}</TableHead>
        <TableHead className="w-[130px] px-3 hidden lg:table-cell">{renderSortableHeader('Pipeline Stage', 'pipeline_stage')}</TableHead>
        <TableHead className="w-[130px] px-3 hidden lg:table-cell">{renderSortableHeader('Follow-up', 'follow_up_date')}</TableHead>
        <TableHead className="w-[100px] px-2">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
