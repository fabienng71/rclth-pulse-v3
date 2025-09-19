
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Package, Clock, AlertTriangle } from 'lucide-react';
import type { VendorGroup } from '@/hooks/useIncomingStock';
import IncomingStockTable from './IncomingStockTable';

interface VendorSectionProps {
  vendorGroup: VendorGroup;
}

const VendorSection: React.FC<VendorSectionProps> = ({ vendorGroup }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <div>
              <CardTitle className="text-xl">
                {vendorGroup.vendorName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Code: {vendorGroup.vendorCode}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{vendorGroup.totalShipments}</span>
              <span className="text-xs text-muted-foreground">shipments</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{vendorGroup.totalItems}</span>
              <span className="text-xs text-muted-foreground">items</span>
            </div>
            
            {vendorGroup.urgentShipments > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {vendorGroup.urgentShipments} urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <IncomingStockTable shipments={vendorGroup.shipments} />
        </CardContent>
      )}
    </Card>
  );
};

export default VendorSection;
