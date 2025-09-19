
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

export const TargetFields = () => {
  const { control, watch } = useFormContext();
  const targetType = watch('target_type');

  return (
    <div className="space-y-4">
      <FormField 
        control={control}
        name="target_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Type</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select target type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="PC">PC</SelectItem>
                <SelectItem value="KG">KG</SelectItem>
                <SelectItem value="Amount">Amount</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="target_value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Value{targetType === 'Amount' ? ' (USD)' : ''}</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
                value={field.value === undefined ? '' : field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
