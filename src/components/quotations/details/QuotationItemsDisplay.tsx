
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { QuotationWithItems } from "@/types/quotations";
import { QuotationItemsTableHeader } from "./items/QuotationItemsTableHeader";
import { QuotationItemRow } from "./items/QuotationItemRow";
import { QuotationItemsTotal } from "./items/QuotationItemsTotal";
import { QuotationItemsEmpty } from "./items/QuotationItemsEmpty";
import { 
  calculateLineTotal, 
  calculateOfferPrice, 
  calculateTotal 
} from "./items/QuotationItemsCalculations";

interface QuotationItemsDisplayProps {
  quotation: QuotationWithItems;
}

export const QuotationItemsDisplay = ({ quotation }: QuotationItemsDisplayProps) => {
  const total = calculateTotal(quotation.items);
  const colSpan = 7;
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <QuotationItemsTableHeader />
          
          {quotation.items.length === 0 ? (
            <QuotationItemsEmpty colSpan={colSpan} />
          ) : (
            <TableBody>
              {quotation.items.map((item, index) => (
                <QuotationItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  calculateLineTotal={calculateLineTotal}
                  calculateOfferPrice={calculateOfferPrice}
                />
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <QuotationItemsTotal total={total} />
    </div>
  );
};
