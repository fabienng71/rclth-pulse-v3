
import { TableRow, TableCell } from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';
import { CustomerPurchase } from './types';

interface CustomerPurchasesTotalsProps {
  customerPurchases: CustomerPurchase[];
  allMonths: string[];
  showAmount: boolean;
}

export function CustomerPurchasesTotals({
  customerPurchases,
  allMonths,
  showAmount
}: CustomerPurchasesTotalsProps) {
  // Calculate totals for each month
  const monthTotals = allMonths.map(month => {
    return customerPurchases.reduce((sum, customer) => {
      const monthData = customer.month_data[month];
      if (monthData) {
        return sum + (showAmount ? monthData.amount : monthData.quantity);
      }
      return sum;
    }, 0);
  });

  // Calculate grand total
  const grandTotal = customerPurchases.reduce((sum, customer) => {
    return sum + (showAmount ? customer.total_amount : customer.total_quantity);
  }, 0);

  return (
    <TableRow>
      <TableCell className="font-bold">Total</TableCell>
      <TableCell></TableCell>
      
      {monthTotals.map((total, index) => (
        <TableCell key={allMonths[index]} className="text-center font-bold">
          {formatNumber(total)}
        </TableCell>
      ))}
      
      <TableCell className="text-center font-bold text-green-600">
        {formatNumber(grandTotal)}
      </TableCell>
      
      {showAmount && (
        <>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </>
      )}
    </TableRow>
  );
}
