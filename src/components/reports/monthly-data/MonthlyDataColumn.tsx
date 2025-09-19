import { TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface MonthData {
  [key: string]: {
    quantity: number;
    amount: number;
    margin?: number;
  }
}

interface MonthlyDataColumnProps {
  monthData: MonthData;
  month: string;
  showAmount: boolean;
  showMargin?: boolean;
}

export const MonthlyDataColumn = ({ 
  monthData, 
  month, 
  showAmount,
  showMargin = false
}: MonthlyDataColumnProps) => {
  if (!monthData[month]) {
    return <TableCell className="text-right">0</TableCell>;
  }

  // If showing margin, use the margin value
  if (showMargin && monthData[month].margin !== undefined) {
    const margin = monthData[month].margin || 0;
    const textColor = margin >= 0 ? 'text-green-600' : 'text-red-500';
    return (
      <TableCell className={`text-right ${textColor}`}>
        {formatCurrency(margin)}
      </TableCell>
    );
  }

  // Otherwise show amount or quantity
  const value = showAmount 
    ? monthData[month].amount 
    : monthData[month].quantity;

  return (
    <TableCell className="text-right text-green-600">
      {formatCurrency(value)}
    </TableCell>
  );
};
