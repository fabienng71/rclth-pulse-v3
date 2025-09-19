
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Package } from 'lucide-react';

interface StockCategorySummaryProps {
  totalItems: number;
  totalValue: number;
  criticalItems: number;
}

export const StockCategorySummary: React.FC<StockCategorySummaryProps> = ({
  totalItems,
  totalValue,
  criticalItems
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <Card>
        <CardContent className="flex items-center p-4">
          <Package className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Items</p>
            <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-4">
          <DollarSign className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stock Value</p>
            <p className="text-2xl font-bold">
              {totalValue.toLocaleString(undefined, { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-4">
          <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Critical Items</p>
            <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
