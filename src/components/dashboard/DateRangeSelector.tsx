
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface DateRangeSelectorProps {
  fromDate: Date;
  toDate: Date;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  showLabel?: boolean;
}

export const DateRangeSelector = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  showLabel = true
}: DateRangeSelectorProps) => {
  const [isFromCalendarOpen, setIsFromCalendarOpen] = useState(false);
  const [isToCalendarOpen, setIsToCalendarOpen] = useState(false);

  return (
    <div className="space-y-2">
      {showLabel && <Label>Date Range</Label>}
      <div className="flex gap-2 w-full">
        <Popover open={isFromCalendarOpen} onOpenChange={setIsFromCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>From: {format(fromDate, "MMM yyyy")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              defaultMonth={fromDate}
              selected={fromDate}
              onSelect={(date) => {
                if (date) {
                  onFromDateChange(startOfMonth(date));
                  setIsFromCalendarOpen(false);
                }
              }}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        
        <Popover open={isToCalendarOpen} onOpenChange={setIsToCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>To: {format(toDate, "MMM yyyy")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              defaultMonth={toDate}
              selected={toDate}
              onSelect={(date) => {
                if (date) {
                  onToDateChange(endOfMonth(date));
                  setIsToCalendarOpen(false);
                }
              }}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
