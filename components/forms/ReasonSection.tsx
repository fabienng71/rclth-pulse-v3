
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { ReturnFormValues } from '@/hooks/returnFormSchema';

interface ReasonSectionProps {
  control: Control<ReturnFormValues>;
  onReasonChange?: (value: string) => void;
}

const ReasonSection = ({ control, onReasonChange }: ReasonSectionProps) => {
  return (
    <>
      <FormField
        control={control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reason for Return</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                onReasonChange?.(value);
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="wrong_product">Wrong Product</SelectItem>
                <SelectItem value="product_damaged">Product Damaged</SelectItem>
                <SelectItem value="client_mistake">Mistake Order by Client</SelectItem>
                <SelectItem value="rcl_mistake">Mistake Order by RCL</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="comment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Comments (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Provide additional details about the return..." 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ReasonSection;
