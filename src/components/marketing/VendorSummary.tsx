
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Package } from 'lucide-react';

interface VendorSummaryProps {
  totalItems: number;
  totalValue: number;
  criticalItems: number;
}

export const VendorSummary: React.FC<VendorSummaryProps> = ({
  totalItems,
  totalValue,
  criticalItems
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Card>
        <CardContent className="flex items-center p-3">
          <Package className="h-6 w-6 text-blue-600 mr-2" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Items</p>
            <p className="text-lg font-bold">{totalItems.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-3">
          <DollarSign className="h-6 w-6 text-green-600 mr-2" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Value</p>
            <p className="text-lg font-bold">
              {totalValue.toLocaleString(undefined, { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center p-3">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
          <div>
            <p className="text-xs font-medium text-muted-foreground">Critical</p>
            <p className="text-lg font-bold text-red-600">{criticalItems}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
