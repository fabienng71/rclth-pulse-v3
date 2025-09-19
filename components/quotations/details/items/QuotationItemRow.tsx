
import { TableCell, TableRow } from "@/components/ui/table";
import { QuotationItem } from "@/types/quotations";
import { formatCurrency } from "@/lib/utils";

interface QuotationItemRowProps {
  item: QuotationItem;
  index: number;
  calculateLineTotal: (item: QuotationItem) => number;
  calculateOfferPrice: (item: QuotationItem) => number;
}

export const QuotationItemRow = ({
  item,
  index,
  calculateLineTotal,
  calculateOfferPrice,
}: QuotationItemRowProps) => {
  return (
    <TableRow key={item.id}>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{item.item_code || "N/A"}</TableCell>
      <TableCell>{item.description}</TableCell>
      <TableCell className="text-right">{item.quantity}</TableCell>
      <TableCell>{item.unit_of_measure || "N/A"}</TableCell>
      <TableCell className="text-right">
        THB {formatCurrency(calculateOfferPrice(item))}
      </TableCell>
      <TableCell className="text-right">
        THB {formatCurrency(calculateLineTotal(item))}
      </TableCell>
    </TableRow>
  );
};
