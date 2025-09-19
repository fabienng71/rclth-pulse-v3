
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Heart, AlertTriangle, CheckCircle } from 'lucide-react';

interface ContactHealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ContactHealthScore: React.FC<ContactHealthScoreProps> = ({
  score,
  size = 'md',
  showLabel = false,
  className
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 40) return Heart;
    return AlertTriangle;
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizes = {
    sm: { progress: 'h-1', icon: 'h-3 w-3', text: 'text-xs' },
    md: { progress: 'h-2', icon: 'h-4 w-4', text: 'text-sm' },
    lg: { progress: 'h-3', icon: 'h-5 w-5', text: 'text-base' }
  };

  const Icon = getScoreIcon(score);

  if (size === 'sm' && !showLabel) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Icon className={cn(sizes[size].icon, getScoreColor(score))} />
        <span className={cn(sizes[size].text, getScoreColor(score), "font-medium")}>
          {score}%
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className={cn(sizes[size].icon, getScoreColor(score))} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Progress 
            value={score} 
            className={cn("flex-1", sizes[size].progress)}
            // Custom color based on score
            style={{
              background: score >= 80 ? '#dcfce7' : 
                         score >= 60 ? '#fef3c7' : 
                         score >= 40 ? '#fed7aa' : '#fecaca'
            }}
          />
          <span className={cn(sizes[size].text, getScoreColor(score), "font-medium w-8")}>
            {score}%
          </span>
        </div>
        {showLabel && (
          <div className={cn(sizes[size].text, "text-muted-foreground mt-1")}>
            Health Score
          </div>
        )}
      </div>
    </div>
  );
};
