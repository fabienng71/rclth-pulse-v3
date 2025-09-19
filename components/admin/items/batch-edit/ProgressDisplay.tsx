import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressDisplayProps {
  progress: number;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ progress }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Processing batch update...</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};