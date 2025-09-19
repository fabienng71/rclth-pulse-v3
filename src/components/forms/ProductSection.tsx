
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ItemSearch } from '@/components/quotations/ItemSearch';
import { Item } from '@/hooks/useItemsData';
import { Control } from 'react-hook-form';
import { ReturnFormValues } from '@/hooks/returnFormSchema';

interface ProductSectionProps {
  control: Control<ReturnFormValues>;
  selectedItem: Item | null;
  handleItemSelect: (itemCode: string) => void;
}

const ProductSection = ({ control, selectedItem, handleItemSelect }: ProductSectionProps) => {
  return (
    <FormField
      control={control}
      name="productCode"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Product</FormLabel>
          <ItemSearch 
            onSelectItem={handleItemSelect}
            placeholder="Search for a product..."
          />
          {selectedItem && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="font-medium">{selectedItem.description || selectedItem.item_code}</p>
              <div className="mt-1 space-y-1">
                <p className="text-sm text-muted-foreground">Code: {selectedItem.item_code}</p>
                {selectedItem.unit_price && (
                  <p className="text-sm text-muted-foreground">Unit Price: ${selectedItem.unit_price.toFixed(2)}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Unit: {selectedItem.base_unit_code || 'N/A'}
                </p>
              </div>
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductSection;
