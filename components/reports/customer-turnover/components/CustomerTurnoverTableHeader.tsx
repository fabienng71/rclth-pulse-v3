
import React from 'react';
import { TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { SortDirection } from '@/hooks/useSortableTable';
import { format, parse } from 'date-fns';

interface CustomerTurnoverTableHeaderProps {
  sortField: string;
  sortDirection: SortDirection;
  handleSort: (field: string) => void;
  uniqueMonths: string[];
}

export const CustomerTurnoverTableHeader: React.FC<CustomerTurnoverTableHeaderProps> = ({
  sortField,
  sortDirection,
  handleSort,
  uniqueMonths
}) => {
  // Format month for display (e.g., "2023-05" to "May")
  const formatMonthDisplay = (yearMonth: string) => {
    try {
      const date = parse(yearMonth, 'yyyy-MM', new Date());
      return format(date, 'MMM');
    } catch (e) {
      return yearMonth;
    }
  };

  return (
    <TableHeader>
      <TableRow>
        <SortableTableHeader 
          field="customer_name" 
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        >
          Customer
        </SortableTableHeader>
        {uniqueMonths.map(month => (
          <SortableTableHeader 
            key={month} 
            field={month}
            currentSortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            align="right"
          >
            {formatMonthDisplay(month)}
          </SortableTableHeader>
        ))}
        <SortableTableHeader 
          field="total"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          align="right"
        >
          Total
        </SortableTableHeader>
      </TableRow>
    </TableHeader>
  );
};
