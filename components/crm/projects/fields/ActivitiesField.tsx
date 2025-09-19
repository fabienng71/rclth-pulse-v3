
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';

export const ActivitiesField = ({ activities }: { activities?: string }) => {
  return (
    <FormItem>
      <FormLabel>Activities</FormLabel>
      <FormControl>
        <Input 
          type="text" 
          value={activities || '0'} 
          disabled
          readOnly
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
