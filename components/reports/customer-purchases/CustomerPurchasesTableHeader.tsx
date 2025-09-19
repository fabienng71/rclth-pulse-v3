
import { SortableTableHeader } from '../SortableTableHeader';
import { TableHead } from '@/components/ui/table';
import { SortDirection } from '@/hooks/useSortableTable';
import { formatMonth } from '../monthly-data';

interface CustomerPurchasesTableHeaderProps {
  allMonths: string[];
  sortField: string;
  sortDirection: SortDirection;
  handleSort: (field: string) => void;
  showAmount: boolean;
}

export function CustomerPurchasesTableHeader({
  allMonths,
  sortField,
  sortDirection,
  handleSort,
  showAmount
}: CustomerPurchasesTableHeaderProps) {
  return (
    <>
      <SortableTableHeader
        field="customer_code"
        currentSortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        className="w-[150px]"
      >
        Customer Code
      </SortableTableHeader>
      <SortableTableHeader
        field="search_name"
        currentSortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        className="w-[200px]"
      >
        Search Name
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
      
      {showAmount && (
        <>
          <TableHead className="text-center">Margin %</TableHead>
          <TableHead className="text-center">Last Price</TableHead>
        </>
      )}
    </>
  );
}
