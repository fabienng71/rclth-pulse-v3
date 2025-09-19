
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Hash } from 'lucide-react';

interface ForecastSessionMetricsProps {
  totalSkus: number;
  totalQuantity: number;
}

export const ForecastSessionMetrics: React.FC<ForecastSessionMetricsProps> = ({
  totalSkus,
  totalQuantity
}) => {
  return (
    <div className="flex gap-4">
      <Card className="flex-1">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-full bg-blue-100 p-2">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{totalSkus}</div>
            <div className="text-sm text-muted-foreground">Total SKUs</div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="flex-1">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-full bg-green-100 p-2">
            <Hash className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{totalQuantity.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Quantity</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
