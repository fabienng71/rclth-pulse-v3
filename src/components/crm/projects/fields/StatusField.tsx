
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useFormContext } from 'react-hook-form';

export const StatusField = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="is_active"
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel>Status</FormLabel>
            <p className="text-sm text-muted-foreground">
              {field.value ? 'Active' : 'Inactive'}
            </p>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
