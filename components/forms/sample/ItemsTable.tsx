
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { SampleRequestItem } from '@/services/sampleRequestService';
import { Checkbox } from '@/components/ui/checkbox';

interface ItemsTableProps {
  items: SampleRequestItem[];
  isSubmitting: boolean;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof SampleRequestItem, value: any) => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  isSubmitting,
  onRemoveItem,
  onUpdateItem
}) => {
  const handleFreeItemChange = (index: number, checked: boolean) => {
    // Update is_free status
    onUpdateItem(index, 'is_free', checked);
    // If checked, set price to 0
    if (checked) {
      onUpdateItem(index, 'price', 0);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Free Item</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No items added. Use the search bar or button above to add items.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={item.item_code}
                    onChange={(e) => onUpdateItem(index, 'item_code', e.target.value)}
                    placeholder="Item code"
                    disabled={isSubmitting}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                    placeholder="Description"
                    disabled={isSubmitting}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      onUpdateItem(index, 'quantity', isNaN(value) ? 0 : value);
                    }}
                    placeholder="Quantity"
                    disabled={isSubmitting}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price === undefined ? '' : item.price}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                      onUpdateItem(index, 'price', value);
                    }}
                    placeholder="Optional"
                    disabled={isSubmitting || item.is_free}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={item.is_free || false}
                    onCheckedChange={(checked) => handleFreeItemChange(index, checked === true)}
                    disabled={isSubmitting}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(index)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
