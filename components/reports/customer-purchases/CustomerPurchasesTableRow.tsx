
import { TableCell, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface CustomerPurchase {
  customer_code: string;
  customer_name: string | null;
  search_name: string | null;
  month_data: {
    [key: string]: {
      amount: number;
      quantity: number;
    }
  };
  total_amount: number;
  total_quantity: number;
  margin_percent: number | null;
  last_unit_price: number | null;
}

interface CustomerPurchasesTableRowProps {
  customer: CustomerPurchase;
  allMonths: string[];
  showAmount: boolean;
}

export function CustomerPurchasesTableRow({
  customer,
  allMonths,
  showAmount
}: CustomerPurchasesTableRowProps) {
  const formatValue = (value: number) => {
    return value === 0 ? '-' : formatCurrency(value);
  };

  return (
    <TableRow>
      <TableCell>{customer.customer_code}</TableCell>
      <TableCell>{customer.search_name || customer.customer_name || '-'}</TableCell>
      
      {allMonths.map(month => (
        <TableCell key={month} className="text-center">
          {customer.month_data[month] 
            ? formatValue(showAmount 
                ? customer.month_data[month].amount 
                : customer.month_data[month].quantity)
            : '-'}
        </TableCell>
      ))}
      
      <TableCell className="text-center font-bold text-green-600">
        {formatValue(showAmount ? customer.total_amount : customer.total_quantity)}
      </TableCell>
      
      {showAmount && (
        <>
          <TableCell className={`text-center font-bold ${
            customer.margin_percent && customer.margin_percent < 25 
              ? 'text-red-500' 
              : 'text-green-600'
          }`}>
            {customer.margin_percent !== null 
              ? `${formatCurrency(customer.margin_percent)}%` 
              : '-'}
          </TableCell>
          
          <TableCell className="text-center">
            {customer.last_unit_price !== null 
              ? `฿${formatCurrency(customer.last_unit_price)}` 
              : '-'}
          </TableCell>
        </>
      )}
    </TableRow>
  );
}
