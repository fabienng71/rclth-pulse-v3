
import { TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface MonthlyData {
  month_data: {
    [key: string]: {
      quantity: number;
      amount: number;
      margin?: number;
    }
  };
}

interface MonthTotalColumnProps {
  monthlyData: MonthlyData[];
  month: string;
  showAmount: boolean;
}

export const MonthTotalColumn = ({ 
  monthlyData, 
  month, 
  showAmount 
}: MonthTotalColumnProps) => {
  // Calculate the total for this month across all items
  const total = monthlyData.reduce((sum, item) => {
    if (item.month_data[month]) {
      return sum + (showAmount 
        ? item.month_data[month].amount 
        : item.month_data[month].quantity);
    }
    return sum;
  }, 0);

  return (
    <TableCell className="text-right font-semibold text-green-600">
      {formatCurrency(total)}
    </TableCell>
  );
};
