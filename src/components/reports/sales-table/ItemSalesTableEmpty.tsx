
import { TableRow, TableCell } from '@/components/ui/table';

interface ItemSalesTableEmptyProps {
  colSpan: number;
}

export function ItemSalesTableEmpty({ colSpan }: ItemSalesTableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
        No sales data available for the selected items in this date range
      </TableCell>
    </TableRow>
  );
}
