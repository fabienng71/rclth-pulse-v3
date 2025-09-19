import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ItemSearch } from '@/components/quotations/ItemSearch';
import { DatePickerField } from '@/components/crm/DatePickerField';
import { PricingInfoDisplay } from './PricingInfoDisplay';
import { clearanceFormSchema, type ClearanceFormValues } from './schema';
import { useItemsData } from '@/hooks/useItemsData';
import { useItemPricingData } from '@/hooks/useItemPricingData';
import type { ClearanceItem } from '@/hooks/useClearanceData';

interface ClearanceFormProps {
  onSubmit: (data: ClearanceFormValues) => Promise<void>;
  isLoading: boolean;
  initialData?: ClearanceItem;
  onCancel: () => void;
}

export const ClearanceForm: React.FC<ClearanceFormProps> = ({
  onSubmit,
  isLoading,
  initialData,
  onCancel,
}) => {
  const { items } = useItemsData();
  
  const form = useForm<ClearanceFormValues>({
    resolver: zodResolver(clearanceFormSchema),
    defaultValues: {
      item_code: '',
      description: '',
      quantity: 1,
      expiration_date: '',
      note: '',
      clearance_price: undefined,
      uom: '',
    },
  });

  const selectedItemCode = form.watch('item_code');
  const { data: pricingData, isLoading: isPricingLoading } = useItemPricingData(selectedItemCode || null);

  // Populate form with initial data for editing
  useEffect(() => {
    if (initialData) {
      form.reset({
        item_code: initialData.item_code,
        description: initialData.description || '',
        quantity: initialData.quantity,
        expiration_date: initialData.expiration_date || '',
        note: initialData.note || '',
        clearance_price: initialData.clearance_price || undefined,
        uom: initialData.uom || '',
      });
    }
  }, [initialData, form]);

  const handleItemSelect = (itemCode: string) => {
    const selectedItem = items.find(item => item.item_code === itemCode);
    if (selectedItem) {
      form.setValue('item_code', selectedItem.item_code);
      form.setValue('description', selectedItem.description || '');
      form.setValue('uom', selectedItem.base_unit_code || '');
    }
  };

  const handleSubmit = async (data: ClearanceFormValues) => {
    await onSubmit(data);
    if (!initialData) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="item_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <ItemSearch
                    onSelectItem={handleItemSelect}
                    disabled={isLoading}
                    placeholder="Search for items..."
                    value={field.value}
                  />
                  {field.value && (
                    <Input
                      value={field.value}
                      readOnly
                      className="bg-muted"
                      placeholder="Selected item code"
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PricingInfoDisplay
          unitPrice={pricingData?.unit_price || null}
          cogsUnit={pricingData?.cogs_unit || null}
          marginPercent={pricingData?.margin_percent || null}
          isLoading={isPricingLoading}
          hasSelectedItem={!!selectedItemCode}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DatePickerField
          name="expiration_date"
          label="Expiration Date"
          control={form.control}
        />

        <FormField
          control={form.control}
          name="clearance_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clearance Price (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  disabled={isLoading}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
