
import { useState, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, getISOWeek, getYear, startOfYear, addWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface WeekSelectorProps {
  selectedWeek: number | null;
  onWeekChange: (weekNumber: number | null) => void;
}

export const WeekSelector = ({ selectedWeek, onWeekChange }: WeekSelectorProps) => {
  const currentDate = new Date();
  const currentYear = getYear(currentDate);
  const currentWeek = getISOWeek(currentDate);
  const totalWeeks = 52;
  
  const handleSelectWeek = useCallback((value: string) => {
    let newWeekNumber: number | null = null;
    
    if (value === 'all') {
      newWeekNumber = null;
    } else if (value === 'current') {
      newWeekNumber = currentWeek;
    } else {
      newWeekNumber = parseInt(value, 10);
    }
    
    if (newWeekNumber !== selectedWeek) {
      onWeekChange(newWeekNumber);
    }
  }, [currentWeek, onWeekChange, selectedWeek]);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    let newWeek: number;
    
    if (!selectedWeek) {
      newWeek = currentWeek;
    } else {
      newWeek = direction === 'prev' ? selectedWeek - 1 : selectedWeek + 1;
      
      if (newWeek < 1) newWeek = totalWeeks;
      if (newWeek > totalWeeks) newWeek = 1;
    }
    
    if (newWeek !== selectedWeek) {
      onWeekChange(newWeek);
    }
  }, [currentWeek, onWeekChange, selectedWeek, totalWeeks]);

  const getWeekDateRangeLabel = useCallback((week: number) => {
    const year = currentYear;
    const firstDayOfYear = startOfYear(new Date(year, 0, 1));
    const weekStart = startOfWeek(addWeeks(firstDayOfYear, week - 1), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
  }, [currentYear]);

  const isCurrentWeek = useCallback((week: number) => {
    return week === currentWeek;
  }, [currentWeek]);

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => navigateWeek('prev')}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Select
        value={selectedWeek === null ? "all" : selectedWeek === currentWeek ? "current" : selectedWeek.toString()}
        onValueChange={handleSelectWeek}
      >
        <SelectTrigger className={cn(
          "h-9 w-[200px]",
          !selectedWeek && "text-muted-foreground"
        )}>
          <SelectValue>
            {selectedWeek 
              ? `Week ${selectedWeek} (${getWeekDateRangeLabel(selectedWeek)})` 
              : "All weeks"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All weeks</SelectItem>
          <SelectItem value="current">
            <div className="flex items-center gap-2">
              <span>Current Week ({getWeekDateRangeLabel(currentWeek)})</span>
              <Badge variant="outline" className="ml-2 bg-primary/10 text-xs">Current</Badge>
            </div>
          </SelectItem>
          
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
            <SelectItem 
              key={`week-${week}`}
              value={week.toString()} 
              className={isCurrentWeek(week) ? "font-medium" : ""}
            >
              Week {week} ({getWeekDateRangeLabel(week)})
              {isCurrentWeek(week) && (
                <Badge variant="outline" className="ml-2 bg-primary/10 text-xs">Current</Badge>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => navigateWeek('next')}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
