
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { ContactFormValues } from "./schema";

interface FormSectionProps {
  control: Control<ContactFormValues>;
  fields: Array<{
    name: keyof ContactFormValues;
    label: string;
    placeholder: string;
    optional?: boolean;
  }>;
}

export const FormSection = ({ control, fields }: FormSectionProps) => {
  return (
    <>
      {fields.map(({ name, label, placeholder, optional }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {label} 
                {!optional && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={placeholder} 
                  {...field} 
                  value={field.value || ""} // Ensure value is never null
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
};
