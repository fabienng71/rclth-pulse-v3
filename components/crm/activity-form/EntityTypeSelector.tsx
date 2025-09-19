
import { Control, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField, FormItem, FormControl } from "@/components/ui/form";

interface EntityTypeSelectorProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
  onEntityTypeChange: (isLead: boolean) => void;
}

export const EntityTypeSelector = <T extends FieldValues = FieldValues>({ control, onEntityTypeChange }: EntityTypeSelectorProps<T>) => {
  return (
    <FormField
      control={control}
      name="is_lead"
      render={({ field }) => (
        <FormItem className="mb-4">
          <FormControl>
            <RadioGroup
              value={field.value ? "lead" : "customer"}
              onValueChange={(value) => {
                const isLead = value === "lead";
                field.onChange(isLead);
                onEntityTypeChange(isLead);
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer">Customer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lead" id="lead" />
                <Label htmlFor="lead">Lead</Label>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
