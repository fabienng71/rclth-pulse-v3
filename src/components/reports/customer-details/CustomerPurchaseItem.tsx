
import { TableCell, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/utils';
import { CustomerPurchase } from './types';

interface CustomerPurchaseItemProps {
  item: CustomerPurchase;
  allMonths: string[];
  showAmount: boolean;
}

export const CustomerPurchaseItem = ({ 
  item, 
  allMonths, 
  showAmount 
}: CustomerPurchaseItemProps) => {
  return (
    <TableRow>
      <TableCell>{item.item_code}</TableCell>
      <TableCell className="unicode-text">{item.description?.normalize('NFC') || '-'}</TableCell>
      <TableCell>{item.base_unit_code || '-'}</TableCell>
      
      {allMonths.map(month => (
        <TableCell key={month} className="text-center">
          {item.month_data[month] ? (
            <span className={
              (item.month_data[month][showAmount ? 'amount' : 'quantity'] === 0) ? 
                'text-xs text-gray-400' : 'text-sm text-gray-500'
            }>
              {formatNumber(showAmount 
                ? item.month_data[month].amount
                : item.month_data[month].quantity)}
            </span>
          ) : '-'}
        </TableCell>
      ))}
      
      <TableCell className="text-center font-bold text-green-600">
        {formatNumber(showAmount 
          ? item.totals.amount
          : item.totals.quantity)}
      </TableCell>

      <TableCell className={`text-center ${
        item.margin_percent && item.margin_percent < 25 ? 'text-red-500' : 'text-green-600'
      }`}>
        {item.margin_percent !== null 
          ? `${formatNumber(item.margin_percent)}%` 
          : '-'}
      </TableCell>

      <TableCell className="text-center">
        {item.last_unit_price !== null 
          ? `฿${formatNumber(item.last_unit_price)}` 
          : '-'}
      </TableCell>
    </TableRow>
  );
};
