import React from 'react';
import { cn } from '@/lib/utils';

interface ItemsTableLoadingStateProps {
  className?: string;
}

export const ItemsTableLoadingState: React.FC<ItemsTableLoadingStateProps> = ({ className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4" />
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="h-16 bg-gray-100 rounded mb-2" />
        ))}
      </div>
    </div>
  );
};