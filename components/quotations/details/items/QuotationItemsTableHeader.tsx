
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const QuotationItemsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">No.</TableHead>
        <TableHead>Item</TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="w-24 text-right">Qty</TableHead>
        <TableHead className="w-24">UoM</TableHead>
        <TableHead className="w-32 text-right">Price</TableHead>
        <TableHead className="w-32 text-right">Total</TableHead>
      </TableRow>
    </TableHeader>
  );
};
