
import React from 'react';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface SelectedItem {
  item_code: string;
  description: string;
  quantity: number;
  base_unit_code?: string;
  direct_unit_cost?: number;
}

interface ItemsTableProps {
  items: SelectedItem[];
  onRemoveItem: (itemCode: string) => void;
  onUpdateQuantity: (itemCode: string, quantity: number) => void;
  onUpdateBaseUnitCode: (itemCode: string, base_unit_code: string) => void;
  onUpdateDirectUnitCost: (itemCode: string, direct_unit_cost: number) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateBaseUnitCode,
  onUpdateDirectUnitCost
}) => {
  const handleQuantityChange = (itemCode: string, value: string) => {
    if (value === '') {
      onUpdateQuantity(itemCode, 0);
    } else {
      const quantity = parseFloat(value);
      if (!isNaN(quantity) && quantity >= 0) {
        onUpdateQuantity(itemCode, quantity);
      }
    }
  };

  const handleBaseUnitCodeChange = (itemCode: string, value: string) => {
    onUpdateBaseUnitCode(itemCode, value);
  };

  const handleDirectUnitCostChange = (itemCode: string, value: string) => {
    if (value === '') {
      onUpdateDirectUnitCost(itemCode, 0);
    } else {
      const cost = parseFloat(value);
      if (!isNaN(cost) && cost >= 0) {
        onUpdateDirectUnitCost(itemCode, cost);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center text-muted-foreground">
        No items added. Use the search field above to add items to this shipment.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Direct Cost</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.item_code}>
              <TableCell className="font-medium">{item.item_code}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Input
                  value={item.base_unit_code || ''}
                  onChange={(e) => handleBaseUnitCodeChange(item.item_code, e.target.value)}
                  placeholder="Unit"
                  className="w-full h-7 p-1"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={item.quantity || ''}
                  onChange={(e) => handleQuantityChange(item.item_code, e.target.value)}
                  className="w-20 h-7 text-center p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.0"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={item.direct_unit_cost || ''}
                  onChange={(e) => handleDirectUnitCostChange(item.item_code, e.target.value)}
                  placeholder="0.00"
                  className="w-full h-7 p-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.item_code)}
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
