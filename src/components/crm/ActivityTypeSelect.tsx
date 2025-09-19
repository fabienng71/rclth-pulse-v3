
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control, FieldValues } from 'react-hook-form';

interface ActivityTypeSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
}

export const ActivityTypeSelect = ({ control }: ActivityTypeSelectProps) => {
  return (
    <FormField
      control={control}
      name="activity_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Activity Type</FormLabel>
          <Select 
            onValueChange={(value) => {
              console.log('Activity type selected:', value);
              field.onChange(value);
            }} 
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select an activity type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Walk-in">Walk-in</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Phone Call">Phone Call</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
