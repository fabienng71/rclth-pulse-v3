
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

interface SalespersonFieldProps {
  control: Control<LeadFormValues>;
  disabled: boolean;
  profiles?: { id: string; full_name: string }[];
  isLoading: boolean;
  error?: any;
}

export const SalespersonField = ({ 
  control, 
  disabled, 
  profiles, 
  isLoading, 
  error 
}: SalespersonFieldProps) => {
  return (
    <FormField
      control={control}
      name="salesperson_code"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-medium">Sales Person</FormLabel>
          <Select
            value={field.value || "none"}
            onValueChange={field.onChange}
            disabled={disabled || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading sales people..." : "Select sales person"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <span className="text-gray-400">No sales person</span>
              </SelectItem>
              {isLoading && (
                <SelectItem value="loading" disabled>Loading sales people...</SelectItem>
              )}
              {error && (
                <SelectItem value="error" disabled>Failed to load</SelectItem>
              )}
              {!isLoading && !error && (!profiles || profiles.length === 0) && (
                <SelectItem value="no-profiles" disabled>No sales people available</SelectItem>
              )}
              {profiles && profiles.map((profile) => {
                const id = profile.id || `profile-${Math.random().toString(36).substring(7)}`;
                const name = profile.full_name || `Profile ${id.slice(0, 8)}`;
                
                return (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {error && (
            <span className="text-destructive text-xs">Failed to load salespersons</span>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
