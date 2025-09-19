
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Shipment } from '@/hooks/useShipments';
import { getCurrentWeekNumber, getWeekBoundaries, formatWeekPeriod } from '@/utils/weekUtils';
import StatusBadge from '@/components/procurement/status/StatusBadge';
import TransportModeBadge from '@/components/procurement/transport/TransportModeBadge';
import { determineShipmentStatus } from '@/components/procurement/utils/shipmentUtils';

interface IncomingShipmentsWidgetProps {
  shipments: Shipment[];
  loading: boolean;
}

const IncomingShipmentsWidget: React.FC<IncomingShipmentsWidgetProps> = ({ 
  shipments, 
  loading 
}) => {
  const navigate = useNavigate();
  const [incomingShipments, setIncomingShipments] = useState<Shipment[]>([]);
  const [weekPeriod, setWeekPeriod] = useState<string>('');
  const [isLoadingWeek, setIsLoadingWeek] = useState(true);

  useEffect(() => {
    const filterIncomingShipments = async () => {
      try {
        setIsLoadingWeek(true);
        const currentYear = new Date().getFullYear();
        const currentWeek = await getCurrentWeekNumber();
        const boundaries = await getWeekBoundaries(currentYear, currentWeek);
        const period = await formatWeekPeriod(currentYear, currentWeek);
        
        setWeekPeriod(period);

        if (boundaries) {
          const filtered = shipments.filter(shipment => {
            if (!shipment.eta) return false;
            const etaDate = new Date(shipment.eta);
            return etaDate >= boundaries.start && etaDate <= boundaries.end;
          });

          // Sort by ETA
          filtered.sort((a, b) => {
            if (!a.eta || !b.eta) return 0;
            return new Date(a.eta).getTime() - new Date(b.eta).getTime();
          });

          setIncomingShipments(filtered.slice(0, 5)); // Limit to 5 rows
        }
      } catch (error) {
        console.error('Error filtering incoming shipments:', error);
        setWeekPeriod('Current Week');
      } finally {
        setIsLoadingWeek(false);
      }
    };

    if (!loading) {
      filterIncomingShipments();
    }
  }, [shipments, loading]);

  if (loading || isLoadingWeek) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle className="text-xl">Incoming This Week</CardTitle>
          </div>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <CardTitle className="text-xl">Incoming This Week</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/procurement/shipments?filter=this-week')}
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <CardDescription>{weekPeriod}</CardDescription>
      </CardHeader>
      <CardContent>
        {incomingShipments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No shipments arriving this week</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingShipments.map((shipment) => {
              const status = determineShipmentStatus(shipment.etd, shipment.eta);
              return (
                <div 
                  key={shipment.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/procurement/${shipment.id}`)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{shipment.vendor_name}</div>
                    <div className="text-sm text-muted-foreground">
                      ETA: {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'TBD'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TransportModeBadge mode={shipment.transport_mode} />
                    <StatusBadge status={status} />
                  </div>
                </div>
              );
            })}
            {shipments.filter(s => s.eta && new Date(s.eta) >= new Date() && new Date(s.eta) <= new Date()).length > 5 && (
              <div className="text-center pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/procurement/shipments?filter=this-week')}
                >
                  View {shipments.filter(s => s.eta).length - 5} more shipments
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomingShipmentsWidget;
