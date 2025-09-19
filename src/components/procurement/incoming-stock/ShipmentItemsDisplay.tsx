import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';

interface ShipmentItemsDisplayProps {
  items: ShipmentItem[];
  shipmentId: string;
}

const ShipmentItemsDisplay: React.FC<ShipmentItemsDisplayProps> = ({ items, shipmentId }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No items found for this shipment
      </div>
    );
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => {
      const itemTotal = (item.direct_unit_cost || 0) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  return (
    <div className="bg-muted/30 p-4 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm text-primary">
          Shipment Items ({items.length} items)
        </h4>
        <div className="flex items-center gap-2">
          {getTotalValue() > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Total Value: {formatCurrency(getTotalValue())}
            </Badge>
          )}
          <Badge variant="outline">
            ID: {shipmentId.slice(0, 8)}...
          </Badge>
        </div>
      </div>
      
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Item Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[80px]">Unit</TableHead>
              <TableHead className="w-[120px] text-right">Unit Cost</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const itemTotal = (item.direct_unit_cost || 0) * item.quantity;
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">
                    {item.item_code}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <div className="font-medium text-sm truncate">
                        {item.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {item.quantity.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {item.base_unit_code || '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(item.direct_unit_cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {item.direct_unit_cost ? formatCurrency(itemTotal) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShipmentItemsDisplay;