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

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateItemDialog: React.FC<CreateItemDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Add a new item to the inventory system
          </DialogDescription>
        </DialogHeader>
        <ItemForm 
          data={formData} 
          setData={setFormData} 
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};