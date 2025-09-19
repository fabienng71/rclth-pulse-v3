
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatePickerSectionProps {
  followUpDate: Date | undefined;
  isSubmitting: boolean;
  onDateChange: (date: Date | undefined) => void;
}

const DatePickerSection: React.FC<DatePickerSectionProps> = ({
  followUpDate,
  isSubmitting,
  onDateChange
}) => {
  return (
    <div>
      <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full mt-1 justify-start text-left font-normal",
              !followUpDate && "text-muted-foreground"
            )}
            disabled={isSubmitting}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {followUpDate ? (
              format(followUpDate, "PPP")
            ) : (
              <span>Select a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={followUpDate}
            onSelect={(date) => onDateChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {followUpDate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={() => onDateChange(undefined)}
        >
          <X className="h-3 w-3 mr-1" /> Clear date
        </Button>
      )}
    </div>
  );
};

export default DatePickerSection;
