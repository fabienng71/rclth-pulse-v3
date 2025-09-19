
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

interface StatusSelectProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
}

export const StatusSelect = <T extends FieldValues = FieldValues>({ control }: StatusSelectProps<T>) => {
  return (
    <FormField
      control={control}
      name="pipeline_stage"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pipeline Stage</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value || 'Lead'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a pipeline stage" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Proposal">Proposal</SelectItem>
              <SelectItem value="Closed Won">Closed Won</SelectItem>
              <SelectItem value="Closed Lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
