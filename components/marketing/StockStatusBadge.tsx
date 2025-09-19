
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StockStatusBadgeProps {
  status: 'critical' | 'low' | 'normal' | 'unknown';
  daysOfStock?: number;
}

export const StockStatusBadge: React.FC<StockStatusBadgeProps> = ({ status, daysOfStock }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'critical':
        return {
          variant: 'destructive' as const,
          icon: '🔴',
          className: ''
        };
      case 'low':
        return {
          variant: 'secondary' as const,
          icon: '🟡',
          className: ''
        };
      case 'normal':
        return {
          variant: 'default' as const,
          icon: '🟢',
          className: 'bg-green-500 hover:bg-green-600 text-white border-green-500'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: '⚪',
          className: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className || ''}`}>
      <span>{config.icon}</span>
      {daysOfStock !== undefined && daysOfStock > 0 && (
        <span className="text-xs">{Math.round(daysOfStock)}d</span>
      )}
    </Badge>
  );
};
