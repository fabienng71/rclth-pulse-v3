
import { SortableTableHeader } from "../../SortableTableHeader";
import { TableHeader, TableRow } from "@/components/ui/table";
import { SortDirection } from "@/hooks/useSortableTable";
import { format } from "date-fns";

interface VendorSalesTableHeaderProps {
  months: string[];
  sortField: string;
  sortDirection: SortDirection;
  handleSort: (field: string) => void;
}

export const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  return `${format(new Date(`${year}-${month}-01`), 'MMM')} ${year.substring(2)}`;
};

export const VendorSalesTableHeader = ({ 
  months, 
  sortField, 
  sortDirection, 
  handleSort 
}: VendorSalesTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <SortableTableHeader
          field="vendor_code"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="w-[200px]"
        >
          Vendor Code
        </SortableTableHeader>
        
        <SortableTableHeader
          field="vendor_name"
          currentSortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          className="w-[300px]"
        >
          Vendor Name
        </SortableTableHeader>
        
        {months.map(month => (
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
      </TableRow>
    </TableHeader>
  );
};
