
import { TableRow, TableCell } from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';
import { MonthlyItemData } from '@/types/sales';

interface ItemSalesTableRowProps {
  item: MonthlyItemData;
  allMonths: string[];
  showAmount: boolean;
  showMarginColumn: boolean;
}

export function ItemSalesTableRow({ 
  item, 
  allMonths, 
  showAmount, 
  showMarginColumn 
}: ItemSalesTableRowProps) {
  return (
    <TableRow key={item.item_code}>
      <TableCell>{item.item_code}</TableCell>
      <TableCell>{item.description || '-'}</TableCell>
      <TableCell className="text-center">{item.base_unit_code || '-'}</TableCell>
      
      {allMonths.map(month => (
        <TableCell key={month} className="text-center">
          {item.month_data[month] ? (
            <span className={item.month_data[month][showAmount ? 'amount' : 'quantity'] === 0 ? 'text-xs text-gray-400' : 'text-sm text-gray-500'}>
              {formatNumber(showAmount ? item.month_data[month].amount : item.month_data[month].quantity)}
            </span>
          ) : '-'}
        </TableCell>
      ))}
      
      <TableCell className="text-center">
        <span className="font-bold text-green-600">
          {formatNumber(showAmount ? item.totals.amount : item.totals.quantity)}
        </span>
      </TableCell>
      
      {showMarginColumn && (
        <TableCell className="text-center">
          <span className={`font-bold ${(item.totals.margin || 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatNumber(item.totals.margin || 0)}
          </span>
        </TableCell>
      )}
    </TableRow>
  );
}
