
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  badge
}) => {
  return (
    <Card className={`${className} min-w-0`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-2 px-2">
        <CardTitle className="text-xs font-medium text-muted-foreground text-center truncate">
          {title}
        </CardTitle>
        <Icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="px-2 pb-2 text-center">
        <div className="text-base font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center justify-center mt-1">
            <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </span>
          </div>
        )}
        {badge && (
          <div className="mt-1 flex justify-center">
            <Badge variant={badge.variant || 'secondary'} className="text-xs px-1 py-0">
              {badge.text}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
