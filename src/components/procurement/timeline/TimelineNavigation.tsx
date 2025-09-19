
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear } from './utils/timelineUtils';

interface TimelineNavigationProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}

const TimelineNavigation: React.FC<TimelineNavigationProps> = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth
}) => {
  const isCurrentMonth = () => {
    const today = new Date();
    return currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousMonth}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="mx-4">
          <h2 className="text-2xl font-bold text-center min-w-[200px]">
            {formatMonthYear(currentMonth)}
          </h2>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextMonth}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isCurrentMonth() && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCurrentMonth}
        >
          Current Month
        </Button>
      )}
    </div>
  );
};

export default TimelineNavigation;
