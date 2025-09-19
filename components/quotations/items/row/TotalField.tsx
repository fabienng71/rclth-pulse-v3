
import { TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface TotalFieldProps {
  item: any;
  calculateLineTotal: (item: any) => number;
}

export const TotalField = ({ item, calculateLineTotal }: TotalFieldProps) => {
  return (
    <TableCell className="font-medium">
      THB {formatCurrency(calculateLineTotal(item))}
    </TableCell>
  );
};
