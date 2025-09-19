
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ShipmentFormValues } from '@/types/shipment';

interface ShipmentTypeSectionProps {
  form: UseFormReturn<ShipmentFormValues>;
}

const ShipmentTypeSection: React.FC<ShipmentTypeSectionProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="shipment_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Shipment Type *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select shipment type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Chill">Chill</SelectItem>
              <SelectItem value="Dry">Dry</SelectItem>
              <SelectItem value="Frozen">Frozen</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ShipmentTypeSection;
