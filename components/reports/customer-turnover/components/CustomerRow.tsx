
import React from 'react';
import { TableCell, TableCellNumeric, TableRow } from '@/components/ui/table';

interface CustomerRowProps {
  customer: {
    code: string;
    name: string;
  };
  monthData: Record<string, number>;
  uniqueMonths: string[];
  total: number;
}

export const CustomerRow: React.FC<CustomerRowProps> = ({
  customer,
  monthData,
  uniqueMonths,
  total
}) => {
  return (
    <TableRow key={customer.code}>
      <TableCell className="font-medium">{customer.name}</TableCell>
      {uniqueMonths.map(month => (
        <TableCellNumeric
          key={`${customer.code}-${month}`}
          value={monthData[month]}
          numberFormat="currency"
        />
      ))}
      <TableCellNumeric 
        value={total} 
        numberFormat="currency"
        className="font-medium" 
      />
    </TableRow>
  );
};
