
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FollowupsStatsCardProps {
  title: string;
  value: number;
  description?: string;
  variant?: 'default' | 'overdue' | 'today' | 'upcoming';
  icon?: React.ReactNode;
}

export const FollowupsStatsCard: React.FC<FollowupsStatsCardProps> = ({
  title,
  value,
  description,
  variant = 'default',
  icon
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'overdue':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'today':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      case 'upcoming':
        return 'border-green-200 bg-green-50 dark:bg-green-950/20';
      default:
        return '';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'overdue':
        return 'text-red-600 dark:text-red-400';
      case 'today':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'upcoming':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-primary';
    }
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', getVariantStyles())}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', getValueColor())}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
