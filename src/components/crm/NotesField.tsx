
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control, FieldValues } from 'react-hook-form';
import { RichTextEditor } from './RichTextEditor';

interface NotesFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
}

export const NotesField = <T extends FieldValues = FieldValues>({ control }: NotesFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes (Optional)</FormLabel>
          <FormControl>
            <RichTextEditor 
              value={field.value || ''}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
