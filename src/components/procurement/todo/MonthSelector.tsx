
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { MONTH_NAMES } from './constants';

interface MonthSelectorProps {
  selectedMonth: string; // Format: "2025-06"
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  const [year, month] = selectedMonth.split('-').map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const navigateMonth = (direction: 'prev' | 'next') => {
    const date = new Date(year, month - 1, 1);
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1));
    
    const newYear = date.getFullYear();
    const newMonth = date.getMonth() + 1;
    const newMonthString = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    
    onMonthChange(newMonthString);
  };

  const handleYearChange = (newYear: string) => {
    const monthString = `${newYear}-${month.toString().padStart(2, '0')}`;
    onMonthChange(monthString);
  };

  const handleMonthChange = (newMonth: string) => {
    const monthString = `${year}-${newMonth.padStart(2, '0')}`;
    onMonthChange(monthString);
  };

  // Generate years (current year - 1 to current year + 2)
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium text-sm">Select Month:</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Select value={month.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((monthName, index) => (
                <SelectItem key={index + 1} value={(index + 1).toString()}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[80px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {MONTH_NAMES[month - 1]} {year}
      </div>
    </div>
  );
};

export default MonthSelector;
