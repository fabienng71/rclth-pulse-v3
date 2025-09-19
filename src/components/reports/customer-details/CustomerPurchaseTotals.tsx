
import { TableCell, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';
import { CustomerPurchase } from './types';
import { Percent } from 'lucide-react';

interface CustomerPurchaseTotalsProps {
  purchaseData: CustomerPurchase[];
  allMonths: string[];
  showAmount: boolean;
  grandTotalQuantity: number;
  grandTotalAmount: number;
}

export const CustomerPurchaseTotals = ({
  purchaseData,
  allMonths,
  showAmount,
  grandTotalQuantity,
  grandTotalAmount
}: CustomerPurchaseTotalsProps) => {
  // Calculate the global margin percentage
  const totalCogs = purchaseData.reduce((sum, item) => {
    if (item.cogs_unit && item.totals.quantity) {
      return sum + (item.cogs_unit * item.totals.quantity);
    }
    return sum;
  }, 0);
  
  const globalMarginPercent = grandTotalAmount > 0 
    ? ((grandTotalAmount - totalCogs) / grandTotalAmount) * 100 
    : 0;
  
  return (
    <>
      {/* Monthly totals row */}
      <TableRow className="border-t-2">
        <TableCell colSpan={3} className="font-bold">Total</TableCell>
        
        {allMonths.map(month => {
          const monthTotal = purchaseData.reduce((sum, item) => {
            if (item.month_data[month]) {
              return sum + (showAmount 
                ? item.month_data[month].amount 
                : item.month_data[month].quantity);
            }
            return sum;
          }, 0);
          
          return (
            <TableCell key={month} className="text-center font-bold">
              <span className={monthTotal === 0 ? "text-xs text-gray-400" : "text-sm text-gray-500"}>
                {monthTotal > 0 ? formatNumber(monthTotal) : '-'}
              </span>
            </TableCell>
          );
        })}
        
        <TableCell className="text-center font-bold text-green-600">
          {formatNumber(showAmount ? grandTotalAmount : grandTotalQuantity)}
        </TableCell>
        
        <TableCell className="text-center font-bold">
          {globalMarginPercent.toFixed(2)}%
        </TableCell>
        
        <TableCell />
      </TableRow>
    </>
  );
};
