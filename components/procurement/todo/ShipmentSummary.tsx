
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Calendar, Package } from 'lucide-react';
import { Shipment } from '@/hooks/useShipments';
import TransportModeBadge from '@/components/procurement/transport/TransportModeBadge';
import StatusBadge from '@/components/procurement/status/StatusBadge';

interface ShipmentSummaryProps {
  shipments: Shipment[];
  monthYear: string;
}

const ShipmentSummary: React.FC<ShipmentSummaryProps> = ({ shipments, monthYear }) => {
  const [year, month] = monthYear.split('-');
  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long' });

  if (shipments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipments for {monthName} {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No shipments scheduled for this month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Shipments for {monthName} {year}
          <Badge variant="secondary">{shipments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {shipments.map(shipment => (
            <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{shipment.vendor_name}</span>
                  <span className="text-sm text-muted-foreground">({shipment.vendor_code})</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {shipment.eta && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>ETA: {new Date(shipment.eta).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {shipment.transport_mode && (
                    <TransportModeBadge mode={shipment.transport_mode} />
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {shipment.status && <StatusBadge status={shipment.status} />}
                {shipment.freight_forwarder && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="h-3 w-3" />
                    <span>{shipment.freight_forwarder}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShipmentSummary;
