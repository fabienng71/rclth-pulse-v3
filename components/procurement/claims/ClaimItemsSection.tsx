
import React from 'react';
import { Button } from '@/components/ui/button';
import ItemSearch from '@/components/forms/sample/ItemSearch';

interface Item {
  item_code: string;
  description: string;
  quantity: number;
  unit_price?: number;
}

interface Props {
  items: Item[];
  addItem: (item: Item) => void;
  removeItem: (idx: number) => void;
  updateItem: (idx: number, field: keyof Item, value: any) => void;
  disabled: boolean;
}

const ClaimItemsSection: React.FC<Props> = ({ items, addItem, removeItem, updateItem, disabled }) => {
  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2">Items <span className="text-destructive">*</span></label>
      <div className="flex gap-2 items-center mb-2">
        <ItemSearch isSubmitting={disabled} onAddItem={addItem} />
      </div>
      <table className="w-full mb-2">
        <thead>
          <tr>
            <th className="text-left">Code</th>
            <th className="text-left">Description</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Unit Price</th>
            <th className="text-right"></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="text-muted-foreground text-center">No items added.</td>
            </tr>
          )}
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.item_code}</td>
              <td>{item.description}</td>
              <td>
                <input type="number" className="w-16 border rounded p-1" value={item.quantity} min={1}
                  onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)} disabled={disabled} />
              </td>
              <td>
                <input type="number" className="w-20 border rounded p-1" value={item.unit_price || ''} placeholder="-" min={0}
                  onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || undefined)} disabled={disabled} />
              </td>
              <td>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={disabled}>✕</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClaimItemsSection;
