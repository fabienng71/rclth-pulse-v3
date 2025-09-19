
import { TableCell, TableRow } from '@/components/ui/table';

interface CustomerPurchasesTableSkeletonProps {
  allMonths: string[];
  showAmount: boolean;
}

export function CustomerPurchasesTableSkeleton({
  allMonths,
  showAmount
}: CustomerPurchasesTableSkeletonProps) {
  return (
    <>
      {Array(5).fill(0).map((_, index) => (
        <TableRow key={`loading-${index}`}>
          <TableCell>
            <div className="text-xs text-muted-foreground">📊 Loading...</div>
          </TableCell>
          <TableCell>
            <div className="text-xs text-muted-foreground">Loading customer data...</div>
          </TableCell>
          {allMonths.map((_, i) => (
            <TableCell key={i} className="text-right">
              <div className="text-xs text-muted-foreground">--</div>
            </TableCell>
          ))}
          <TableCell className="text-right">
            <div className="text-xs text-muted-foreground">--</div>
          </TableCell>
          {showAmount && (
            <>
              <TableCell className="text-right">
                <div className="text-xs text-muted-foreground">--</div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-xs text-muted-foreground">--</div>
              </TableCell>
            </>
          )}
        </TableRow>
      ))}
    </>
  );
}
