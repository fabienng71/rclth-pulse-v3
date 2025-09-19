
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { ShipmentFormValues } from '@/types/shipment';

interface TransportModeFieldProps {
  control: Control<ShipmentFormValues>;
  disabled?: boolean;
}

const TransportModeField: React.FC<TransportModeFieldProps> = ({
  control,
  disabled = false
}) => {
  return (
    <FormField
      control={control}
      name="transport_mode"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Transport Mode</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
              disabled={disabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sea" id="sea" />
                <label htmlFor="sea" className="cursor-pointer">Sea</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="air" id="air" />
                <label htmlFor="air" className="cursor-pointer">Air</label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TransportModeField;
