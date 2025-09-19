
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { ShipmentFormValues } from '@/types/shipment';

interface FreightForwarderFieldProps {
  control: Control<ShipmentFormValues>;
  disabled?: boolean;
}

const FreightForwarderField: React.FC<FreightForwarderFieldProps> = ({ 
  control,
  disabled = false
}) => {
  return (
    <FormField
      control={control}
      name="freight_forwarder"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Freight Forwarder</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter freight forwarder" 
              {...field} 
              value={field.value || ""}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FreightForwarderField;
