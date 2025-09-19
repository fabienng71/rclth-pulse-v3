
import React from 'react';
import { TableCell, TableCellNumeric, TableRow } from '@/components/ui/table';

interface TotalsRowProps {
  monthTotals: Record<string, number>;
  uniqueMonths: string[];
  grandTotal: number;
}

export const TotalsRow: React.FC<TotalsRowProps> = ({
  monthTotals,
  uniqueMonths,
  grandTotal
}) => {
  return (
    <TableRow className="bg-muted/80">
      <TableCell className="font-bold">Totals</TableCell>
      {uniqueMonths.map(month => (
        <TableCellNumeric
          key={`total-${month}`}
          value={monthTotals[month]}
          numberFormat="currency"
          className="font-bold"
        />
      ))}
      <TableCellNumeric 
        value={grandTotal} 
        numberFormat="currency"
        className="font-bold" 
      />
    </TableRow>
  );
};
