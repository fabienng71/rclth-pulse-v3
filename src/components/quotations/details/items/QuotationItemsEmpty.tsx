
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

interface QuotationItemsEmptyProps {
  colSpan: number;
}

export const QuotationItemsEmpty = ({ colSpan }: QuotationItemsEmptyProps) => {
  return (
    <TableBody>
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center py-4 text-muted-foreground">
          No items added to this quotation
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
