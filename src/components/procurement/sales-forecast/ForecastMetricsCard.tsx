
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package } from 'lucide-react';

interface ForecastMetricsCardProps {
  totalQuantity: number;
  totalSkus: number;
}

export const ForecastMetricsCard: React.FC<ForecastMetricsCardProps> = ({
  totalQuantity,
  totalSkus
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Forecast Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalQuantity}</div>
            <div className="text-sm text-muted-foreground">Total Quantity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalSkus}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Package className="h-3 w-3" />
              SKUs Forecasted
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
