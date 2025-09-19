
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ItemFormData {
  item_code: string;
  description: string;
  posting_group: string;
  base_unit_code: string;
  unit_price: number;
  vendor_code: string;
  brand: string;
  attribut_1: string;
  pricelist: boolean;
}

interface ItemFormProps {
  data: ItemFormData;
  setData: React.Dispatch<React.SetStateAction<ItemFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isEdit?: boolean;
}

export const ItemForm = ({ data, setData, onSubmit, isEdit = false }: ItemFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="item_code">Item Code *</Label>
      <Input
        id="item_code"
        value={data.item_code}
        onChange={(e) => setData({ ...data, item_code: e.target.value })}
        required
        disabled={isEdit}
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="description">Description *</Label>
      <Input
        id="description"
        value={data.description}
        onChange={(e) => setData({ ...data, description: e.target.value })}
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="posting_group">Posting Group</Label>
        <Input
          id="posting_group"
          value={data.posting_group}
          onChange={(e) => setData({ ...data, posting_group: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="base_unit_code">Base Unit Code</Label>
        <Input
          id="base_unit_code"
          value={data.base_unit_code}
          onChange={(e) => setData({ ...data, base_unit_code: e.target.value })}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="unit_price">Unit Price</Label>
        <Input
          id="unit_price"
          type="number"
          step="0.01"
          min="0"
          value={data.unit_price}
          onChange={(e) => setData({ ...data, unit_price: parseFloat(e.target.value) || 0 })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="vendor_code">Vendor Code</Label>
        <Input
          id="vendor_code"
          value={data.vendor_code}
          onChange={(e) => setData({ ...data, vendor_code: e.target.value })}
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Input
          id="brand"
          value={data.brand}
          onChange={(e) => setData({ ...data, brand: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="attribut_1">Attribute 1</Label>
        <Input
          id="attribut_1"
          value={data.attribut_1}
          onChange={(e) => setData({ ...data, attribut_1: e.target.value })}
        />
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Switch
        id="pricelist"
        checked={data.pricelist}
        onCheckedChange={(checked) => setData({ ...data, pricelist: checked })}
      />
      <Label htmlFor="pricelist">Include in Pricelist</Label>
    </div>

    <div className="flex justify-end space-x-2">
      <Button type="submit">
        {isEdit ? 'Update Item' : 'Create Item'}
      </Button>
    </div>
  </form>
);
