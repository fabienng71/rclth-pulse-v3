
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { LeadFormValues } from "@/hooks/useLeadForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusFieldProps {
  control: Control<LeadFormValues>;
  disabled: boolean;
}

export const StatusField = ({ control, disabled }: StatusFieldProps) => {
  return (
    <FormField
      control={control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-medium">Status</FormLabel>
          <Select
            value={field.value || "New"}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Deal in Progress">Deal in Progress</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Not Qualified">Not Qualified</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
