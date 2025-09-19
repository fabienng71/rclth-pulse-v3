
import React from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';

type EditableItem = ShipmentItem & {
  isNew?: boolean;
  isDeleted?: boolean;
};

interface ShipmentItemsTableProps {
  items: EditableItem[];
  onRemoveItem: (id: string) => void;
  onItemChange: (id: string, field: keyof EditableItem, value: any) => void;
}

export const ShipmentItemsTable: React.FC<ShipmentItemsTableProps> = ({
  items,
  onRemoveItem,
  onItemChange
}) => {
  const handleQuantityChange = (id: string, value: string) => {
    if (value === '') {
      onItemChange(id, 'quantity', 0);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onItemChange(id, 'quantity', numValue);
      }
    }
  };

  const handleDirectUnitCostChange = (id: string, value: string) => {
    if (value === '') {
      onItemChange(id, 'direct_unit_cost', null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        onItemChange(id, 'direct_unit_cost', numValue);
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Direct Unit Cost</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <EmptyShipmentItems />
        ) : (
          items.map((item) => (
            <ShipmentItemRow 
              key={item.id} 
              item={item}
              onRemove={onRemoveItem}
              onChange={onItemChange}
              onQuantityChange={handleQuantityChange}
              onDirectUnitCostChange={handleDirectUnitCostChange}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

const EmptyShipmentItems = () => (
  <TableRow>
    <TableCell colSpan={5} className="h-24 text-center">
      <div className="flex flex-col items-center justify-center text-gray-500">
        <Package className="h-8 w-8 mb-2" />
        <p>No items in this shipment</p>
      </div>
    </TableCell>
  </TableRow>
);

interface ShipmentItemRowProps {
  item: EditableItem;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof EditableItem, value: any) => void;
  onQuantityChange: (id: string, value: string) => void;
  onDirectUnitCostChange: (id: string, value: string) => void;
}

const ShipmentItemRow: React.FC<ShipmentItemRowProps> = ({ 
  item, 
  onRemove, 
  onChange, 
  onQuantityChange, 
  onDirectUnitCostChange 
}) => {
  return (
    <TableRow>
      <TableCell>
        <Input 
          value={item.item_code} 
          onChange={(e) => onChange(item.id, 'item_code', e.target.value)} 
          placeholder="Item code"
        />
      </TableCell>
      <TableCell>
        <Input 
          value={item.description} 
          onChange={(e) => onChange(item.id, 'description', e.target.value)} 
          placeholder="Description"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number" 
          min="0"
          step="any"
          value={item.quantity || ''}
          onChange={(e) => onQuantityChange(item.id, e.target.value)}
          className="w-20 ml-auto text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.0"
        />
      </TableCell>
      <TableCell className="text-right">
        <Input 
          type="number" 
          min="0"
          step="any"
          value={item.direct_unit_cost || ''}
          onChange={(e) => onDirectUnitCostChange(item.id, e.target.value)}
          className="w-24 ml-auto text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="0.00"
        />
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onRemove(item.id)}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
