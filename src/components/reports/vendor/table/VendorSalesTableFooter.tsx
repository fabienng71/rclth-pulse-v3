
import { TableFooter, TableCell, TableCellNumeric, TableRow } from "@/components/ui/table";
import { VendorSalesData } from "@/hooks/useVendorSalesData";
import { useMemo } from "react";

interface VendorSalesTableFooterProps {
  data: VendorSalesData[];
  months: string[];
}

export const VendorSalesTableFooter = ({ data, months }: VendorSalesTableFooterProps) => {
  // Calculate totals for each month and grand total
  const { monthlyTotals, grandTotal } = useMemo(() => {
    const monthlyTotals: Record<string, number> = {};
    let grandTotal = 0;

    months.forEach(month => {
      monthlyTotals[month] = 0;
      data.forEach(vendor => {
        monthlyTotals[month] += vendor.months[month] || 0;
      });
      grandTotal += monthlyTotals[month];
    });

    return { monthlyTotals, grandTotal };
  }, [data, months]);

  return (
    <TableFooter>
      <TableRow className="border-t-2 border-gray-200">
        <TableCell colSpan={2} className="font-bold">
          Grand Total
        </TableCell>
        
        {months.map(month => (
          <TableCellNumeric 
            key={month} 
            value={monthlyTotals[month]}
            className="text-center font-bold"
          />
        ))}
        
        <TableCellNumeric 
          value={grandTotal}
          className="text-center font-bold"
        />
      </TableRow>
    </TableFooter>
  );
};
