import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ItemForm } from '@/components/admin/items/ItemForm';

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

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: ItemFormData | null;
  setEditingItem: (data: ItemFormData | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditItemDialog: React.FC<EditItemDialogProps> = ({
  open,
  onOpenChange,
  editingItem,
  setEditingItem,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update item information
          </DialogDescription>
        </DialogHeader>
        {editingItem && (
          <ItemForm 
            data={editingItem} 
            setData={setEditingItem} 
            onSubmit={onSubmit}
            isEdit={true}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};