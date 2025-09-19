
import { TableBody, TableCellNumeric, TableCellText, TableRow } from "@/components/ui/table";
import { VendorSalesData } from "@/hooks/useVendorSalesData";

interface VendorSalesTableBodyProps {
  data: VendorSalesData[];
  months: string[];
}

export const VendorSalesTableBody = ({ data, months }: VendorSalesTableBodyProps) => {
  return (
    <TableBody>
      {data.map((vendor) => (
        <TableRow key={vendor.vendor_code}>
          <TableCellText value={vendor.vendor_code} />
          <TableCellText value={vendor.vendor_name} />
          
          {months.map(month => (
            <TableCellNumeric 
              key={month} 
              value={vendor.months[month]} 
              className="text-center"
            />
          ))}
          
          <TableCellNumeric 
            value={vendor.total} 
            className="text-center font-bold"
          />
        </TableRow>
      ))}
    </TableBody>
  );
};
