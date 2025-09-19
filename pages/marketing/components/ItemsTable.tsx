
import React from 'react';
import { Table, TableBody, TableCell, TableCellText, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnhancedTableCellText } from '@/components/ui/table/components/EnhancedTableCellText';
import { PriceListItem } from '@/hooks/usePriceListData';

interface ItemsTableProps {
  items: PriceListItem[];
  formatPrice: (price: number | null) => string;
}

export const ItemsTable = ({ items, formatPrice }: ItemsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Item Code</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Unit</TableHead>
        <TableHead className="text-right">Price</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.item_code}>
          <TableCell>{item.item_code}</TableCell>
          <EnhancedTableCellText value={item.description} strategy="force-html" />
          <TableCellText value={item.base_unit_code} />
          <TableCell className="text-right">
            {formatPrice(item.unit_price)}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
