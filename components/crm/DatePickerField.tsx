
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control, FieldValues } from 'react-hook-form';

interface DatePickerFieldProps<T extends FieldValues = FieldValues> {
  name: string;
  label: string;
  control: Control<T>;
  isOptional?: boolean;
}

export const DatePickerField = <T extends FieldValues = FieldValues>({ name, label, control, isOptional = false }: DatePickerFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Helper function to check if a date is valid
        const isValidDate = (date: unknown): date is Date => {
          return date instanceof Date && !isNaN(date.getTime());
        };

        // Convert string to Date for display, with proper validation
        let dateValue: Date | undefined = undefined;
        
        if (field.value) {
          if (typeof field.value === 'string') {
            // Try to parse the date string
            const parsedDate = new Date(field.value + 'T00:00:00');
            if (isValidDate(parsedDate)) {
              dateValue = parsedDate;
            }
          } else if (isValidDate(field.value)) {
            dateValue = field.value;
          }
        }
        
        const handleDateSelect = (date: Date | undefined) => {
          if (date && isValidDate(date)) {
            // Use local timezone formatting to avoid timezone conversion issues
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const localDateString = `${year}-${month}-${day}`;
            field.onChange(localDateString);
          } else {
            field.onChange('');
          }
        };
        
        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}{isOptional && ' (Optional)'}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !dateValue && "text-muted-foreground"
                    )}
                  >
                    {dateValue && isValidDate(dateValue) ? (
                      format(dateValue, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <div className="bg-white border rounded-md shadow-lg">
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
