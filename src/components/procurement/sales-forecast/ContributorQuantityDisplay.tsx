
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CollaborativeForecastData } from '@/hooks/useForecastSessions';

interface ContributorQuantityDisplayProps {
  forecasts: CollaborativeForecastData[];
}

export const ContributorQuantityDisplay: React.FC<ContributorQuantityDisplayProps> = ({
  forecasts
}) => {
  const totalQuantity = forecasts.reduce((sum, f) => sum + (f.forecast_quantity || 0), 0);
  const quantities = forecasts.map(f => f.forecast_quantity || 0);
  
  if (quantities.length === 0) return <Badge variant="outline">0</Badge>;
  
  if (quantities.length === 1) {
    return <Badge variant="outline">{totalQuantity}</Badge>;
  }
  
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {quantities.map((qty, idx) => (
        <span key={idx} className="text-sm text-muted-foreground">
          {qty}{idx < quantities.length - 1 ? ',' : ''}
        </span>
      ))}
      <span className="text-sm text-muted-foreground mx-1">→</span>
      <Badge variant="outline" className="font-semibold">
        {totalQuantity}
      </Badge>
    </div>
  );
};
