
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  followUpDate?: string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  followUpDate, 
  className 
}) => {
  if (!followUpDate) {
    return (
      <Badge variant="secondary" className={cn("bg-gray-100 text-gray-700 border-gray-200", className)}>
        No Date
      </Badge>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const followUp = new Date(followUpDate);
  followUp.setHours(0, 0, 0, 0);
  
  const diffTime = followUp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-red-100 text-red-700 border-red-200", className)}
      >
        Overdue ({Math.abs(diffDays)}d)
      </Badge>
    );
  } else if (diffDays === 0) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-yellow-100 text-yellow-700 border-yellow-200", className)}
      >
        Due Today
      </Badge>
    );
  } else if (diffDays === 1) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-orange-100 text-orange-700 border-orange-200", className)}
      >
        Tomorrow
      </Badge>
    );
  } else if (diffDays <= 7) {
    return (
      <Badge 
        variant="outline" 
        className={cn("bg-blue-100 text-blue-700 border-blue-200", className)}
      >
        {diffDays} days
      </Badge>
    );
  } else {
    return (
      <Badge 
        variant="secondary" 
        className={cn("bg-gray-100 text-gray-700 border-gray-200", className)}
      >
        {diffDays} days
      </Badge>
    );
  }
};
