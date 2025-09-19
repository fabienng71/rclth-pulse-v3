
import { TableRow, TableCell } from '@/components/ui/table';

interface ItemSalesTableLoadingProps {
  rowCount: number;
  columnCount: number;
  showMarginColumn: boolean;
}

export function ItemSalesTableLoading({ 
  rowCount, 
  columnCount, 
  showMarginColumn 
}: ItemSalesTableLoadingProps) {
  return (
    <>
      {Array(rowCount).fill(0).map((_, index) => (
        <TableRow key={`loading-${index}`}>
          <TableCell>
            <div className="text-xs text-muted-foreground">📊 Loading...</div>
          </TableCell>
          <TableCell>
            <div className="text-xs text-muted-foreground">Loading item data...</div>
          </TableCell>
          <TableCell>
            <div className="text-xs text-muted-foreground">--</div>
          </TableCell>
          
          {Array(columnCount).fill(0).map((_, i) => (
            <TableCell key={i} className="text-right">
              <div className="text-xs text-muted-foreground">--</div>
            </TableCell>
          ))}
          
          <TableCell className="text-right">
            <div className="text-xs text-muted-foreground">--</div>
          </TableCell>
          
          {showMarginColumn && (
            <TableCell className="text-right">
              <div className="text-xs text-muted-foreground">--</div>
            </TableCell>
          )}
        </TableRow>
      ))}
    </>
  );
}
