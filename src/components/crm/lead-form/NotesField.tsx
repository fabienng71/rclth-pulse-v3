
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { LeadFormValues } from "@/hooks/useLeadForm";
import { RichTextEditor } from "@/components/crm/RichTextEditor";

interface NotesFieldProps {
  control: Control<LeadFormValues>;
  disabled: boolean;
}

export const NotesField = ({ control, disabled }: NotesFieldProps) => {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-medium">Notes (Optional)</FormLabel>
          <FormControl>
            <RichTextEditor 
              value={field.value || ''}
              onChange={field.onChange}
              readOnly={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
