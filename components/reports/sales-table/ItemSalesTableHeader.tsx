
import { SortableTableHeader } from '../SortableTableHeader';
import { TableRow, TableHeader } from '@/components/ui/table';
import { SortDirection } from '@/hooks/useSortableTable';
import { formatMonth } from '../monthly-data';

type SortField = 'item_code' | 'description' | 'base_unit_code' | 'total' | 'margin' | string;

interface ItemSalesTableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
  allMonths: string[];
  showMarginColumn: boolean;
}

export function ItemSalesTableHeader({
  sortField,
  sortDirection,
  handleSort,
  allMonths,
  showMarginColumn
}: ItemSalesTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <SortableTableHeader
          field="item_code"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="w-[150px]"
        >
          Item Code
        </SortableTableHeader>
        <SortableTableHeader
          field="description"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="w-[250px]"
        >
          Description
        </SortableTableHeader>
        <SortableTableHeader
          field="base_unit_code"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          align="center"
        >
          Unit
        </SortableTableHeader>
        
        {allMonths.map(month => (
          <SortableTableHeader
            key={month}
            field={month}
            currentSortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            align="center"
          >
            {formatMonth(month)}
          </SortableTableHeader>
        ))}
        
        <SortableTableHeader
          field="total"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          align="center"
        >
          Total
        </SortableTableHeader>

        {showMarginColumn && (
          <SortableTableHeader
            field="margin"
            currentSortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            align="center"
          >
            Margin
          </SortableTableHeader>
        )}
      </TableRow>
    </TableHeader>
  );
}
