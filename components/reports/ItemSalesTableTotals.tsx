
import { TableRow, TableCell, TableFooter } from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';
import { MonthlyItemData } from '@/types/sales';

interface ItemSalesTableTotalsProps {
  monthlyData: MonthlyItemData[];
  allMonths: string[];
  showAmount: boolean;
  showMarginColumn: boolean;
}

export function ItemSalesTableTotals({
  monthlyData,
  allMonths,
  showAmount,
  showMarginColumn
}: ItemSalesTableTotalsProps) {
  // Calculate totals for each month
  const monthTotals = allMonths.map(month => {
    return monthlyData.reduce((sum, item) => {
      const monthData = item.month_data[month];
      if (monthData) {
        return sum + (showAmount ? monthData.amount : monthData.quantity);
      }
      return sum;
    }, 0);
  });

  // Calculate grand totals
  const grandTotal = monthlyData.reduce((sum, item) => {
    return sum + (showAmount ? item.totals.amount : item.totals.quantity);
  }, 0);

  const grandMarginTotal = showMarginColumn ? monthlyData.reduce((sum, item) => {
    return sum + (item.totals.margin || 0);
  }, 0) : 0;

  return (
    <TableFooter>
      <TableRow>
        <TableCell className="font-bold">Total</TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        
        {monthTotals.map((total, index) => (
          <TableCell key={allMonths[index]} className="text-center font-bold">
            {formatNumber(total)}
          </TableCell>
        ))}
        
        <TableCell className="text-center font-bold text-green-600">
          {formatNumber(grandTotal)}
        </TableCell>
        
        {showMarginColumn && (
          <TableCell className="text-center font-bold">
            {formatNumber(grandMarginTotal)}
          </TableCell>
        )}
      </TableRow>
    </TableFooter>
  );
}
