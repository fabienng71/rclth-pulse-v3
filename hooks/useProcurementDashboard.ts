
import { useMemo } from 'react';
import type { Shipment } from '@/hooks/useShipments';
import { determineShipmentStatus } from '@/components/procurement/utils/shipmentUtils';

export interface ProcurementMetrics {
  totalShipments: number;
  pendingArrivals: number;
  overdueShipments: number;
  inTransitShipments: number;
  averageDeliveryDays: number;
  onTimeDeliveryPercentage: number;
  transportModeStats: {
    air: number;
    sea: number;
    land: number;
    total: number;
  };
  statusDistribution: {
    pending: number;
    in_transit: number;
    delivered: number;
    delayed: number;
  };
}

export const useProcurementDashboard = (shipments: Shipment[]) => {
  const metrics = useMemo(() => {
    console.log(`[useProcurementDashboard] Processing ${shipments.length} shipments`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pendingArrivals = 0;
    let overdueShipments = 0;
    let inTransitShipments = 0;
    let totalDeliveryDays = 0;
    let completedShipments = 0;
    let onTimeDeliveries = 0;

    const transportModeStats = { air: 0, sea: 0, land: 0, total: shipments.length };
    const statusDistribution = { pending: 0, in_transit: 0, delivered: 0, delayed: 0 };

    shipments.forEach(shipment => {
      const status = determineShipmentStatus(shipment.etd, shipment.eta);
      
      // Count transport modes with case-insensitive comparison
      const transportMode = shipment.transport_mode?.toLowerCase();
      console.log(`[useProcurementDashboard] Shipment ${shipment.id}: transport_mode="${shipment.transport_mode}" (normalized: "${transportMode}")`);
      
      if (transportMode === 'air') {
        transportModeStats.air++;
      } else if (transportMode === 'sea') {
        transportModeStats.sea++;
      } else if (transportMode === 'land') {
        transportModeStats.land++;
      }

      // Count status distribution
      if (status === 'pending') statusDistribution.pending++;
      else if (status === 'in_transit') statusDistribution.in_transit++;
      else if (status === 'delivered') statusDistribution.delivered++;
      else if (status === 'delayed') statusDistribution.delayed++;

      // Calculate specific metrics
      if (shipment.eta) {
        const etaDate = new Date(shipment.eta);
        etaDate.setHours(0, 0, 0, 0);

        if (status === 'pending' || status === 'in_transit') {
          if (etaDate >= today) {
            pendingArrivals++;
          }
          if (status === 'in_transit') {
            inTransitShipments++;
          }
        }

        if (status === 'delayed' || (etaDate < today && status !== 'delivered')) {
          overdueShipments++;
        }
      }

      // Calculate delivery performance for completed shipments
      if (shipment.etd && shipment.eta && (status === 'delivered' || status === 'delayed')) {
        const etdDate = new Date(shipment.etd);
        const etaDate = new Date(shipment.eta);
        const deliveryDays = Math.ceil((etaDate.getTime() - etdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (deliveryDays > 0) {
          totalDeliveryDays += deliveryDays;
          completedShipments++;
          
          // Consider on-time if delivered by ETA (for now, we assume delivered = on time)
          if (status === 'delivered') {
            onTimeDeliveries++;
          }
        }
      }
    });

    console.log(`[useProcurementDashboard] Transport mode stats:`, {
      air: transportModeStats.air,
      sea: transportModeStats.sea,
      land: transportModeStats.land,
      total: transportModeStats.total,
      calculated_total: transportModeStats.air + transportModeStats.sea + transportModeStats.land
    });

    const averageDeliveryDays = completedShipments > 0 ? Math.round(totalDeliveryDays / completedShipments) : 0;
    const onTimeDeliveryPercentage = completedShipments > 0 ? Math.round((onTimeDeliveries / completedShipments) * 100) : 0;

    return {
      totalShipments: shipments.length,
      pendingArrivals,
      overdueShipments,
      inTransitShipments,
      averageDeliveryDays,
      onTimeDeliveryPercentage,
      transportModeStats,
      statusDistribution,
    };
  }, [shipments]);

  return metrics;
};
