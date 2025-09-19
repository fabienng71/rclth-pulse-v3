
import { TableCell, TableRow } from '@/components/ui/table';

interface CustomerPurchasesEmptyStateProps {
  colSpan: number;
}

export function CustomerPurchasesEmptyState({ colSpan }: CustomerPurchasesEmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
        No customer purchase data available for the selected items in this date range
      </TableCell>
    </TableRow>
  );
}
