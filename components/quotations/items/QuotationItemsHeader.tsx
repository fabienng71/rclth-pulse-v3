
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface QuotationItemsHeaderProps {
  readOnly?: boolean;
}

export const QuotationItemsHeader = ({
  readOnly = false,
}: QuotationItemsHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        {!readOnly && <TableHead className="w-12">#</TableHead>}
        <TableHead>Item Code</TableHead>
        <TableHead>Description</TableHead>
        <TableHead className="w-24">Qty</TableHead>
        <TableHead className="w-24">UoM</TableHead>
        <TableHead className="w-32">Price</TableHead>
        <TableHead className="w-32">Total</TableHead>
        {!readOnly && <TableHead className="w-12"></TableHead>}
      </TableRow>
    </TableHeader>
  );
};
