
import { useMemo } from 'react';
import type { Shipment } from '@/hooks/useShipments';
import { determineShipmentStatus } from '@/components/procurement/utils/shipmentUtils';

export interface EnhancedProcurementMetrics {
  totalShipments: number;
  totalShipmentsIncludingArchived: number;
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
  archivedStats: {
    totalArchived: number;
    completedShipments: number;
  };
}

export const useProcurementDashboardEnhanced = (
  activeShipments: Shipment[], 
  archivedShipments: Shipment[] = []
) => {
  const metrics = useMemo(() => {
    const allShipments = [...activeShipments, ...archivedShipments];
    console.log(`[useProcurementDashboardEnhanced] Processing ${activeShipments.length} active + ${archivedShipments.length} archived = ${allShipments.length} total shipments`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let pendingArrivals = 0;
    let overdueShipments = 0;
    let inTransitShipments = 0;
    let totalDeliveryDays = 0;
    let completedShipments = 0;
    let onTimeDeliveries = 0;

    // Count transport modes across ALL shipments (active + archived)
    const transportModeStats = { air: 0, sea: 0, land: 0, total: allShipments.length };
    const statusDistribution = { pending: 0, in_transit: 0, delivered: 0, delayed: 0 };

    // Process ALL shipments for transport mode stats
    allShipments.forEach(shipment => {
      const transportMode = shipment.transport_mode?.toLowerCase();
      console.log(`[useProcurementDashboardEnhanced] Shipment ${shipment.id}: transport_mode="${shipment.transport_mode}" (normalized: "${transportMode}"), archived: ${!!shipment.archive}`);
      
      if (transportMode === 'air') {
        transportModeStats.air++;
      } else if (transportMode === 'sea') {
        transportModeStats.sea++;
      } else if (transportMode === 'land') {
        transportModeStats.land++;
      }
    });

    // Process active shipments for current operations
    activeShipments.forEach(shipment => {
      const status = determineShipmentStatus(shipment.etd, shipment.eta);

      // Count status distribution (only for active shipments)
      if (status === 'pending') statusDistribution.pending++;
      else if (status === 'in_transit') statusDistribution.in_transit++;
      else if (status === 'delivered') statusDistribution.delivered++;
      else if (status === 'delayed') statusDistribution.delayed++;

      // Calculate specific metrics for active shipments
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
    });

    // Process all shipments (including archived) for delivery performance
    allShipments.forEach(shipment => {
      if (shipment.etd && shipment.eta) {
        const etdDate = new Date(shipment.etd);
        const etaDate = new Date(shipment.eta);
        const status = determineShipmentStatus(shipment.etd, shipment.eta);
        
        // Consider archived shipments as completed
        if (status === 'delivered' || shipment.archive) {
          const deliveryDays = Math.ceil((etaDate.getTime() - etdDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (deliveryDays > 0) {
            totalDeliveryDays += deliveryDays;
            completedShipments++;
            
            // Consider on-time if delivered by ETA or archived
            if (status === 'delivered' || shipment.archive) {
              onTimeDeliveries++;
            }
          }
        }
      }
    });

    console.log(`[useProcurementDashboardEnhanced] Transport mode stats:`, {
      air: transportModeStats.air,
      sea: transportModeStats.sea,
      land: transportModeStats.land,
      total: transportModeStats.total,
      calculated_total: transportModeStats.air + transportModeStats.sea + transportModeStats.land
    });

    const averageDeliveryDays = completedShipments > 0 ? Math.round(totalDeliveryDays / completedShipments) : 0;
    const onTimeDeliveryPercentage = completedShipments > 0 ? Math.round((onTimeDeliveries / completedShipments) * 100) : 0;

    return {
      totalShipments: activeShipments.length,
      totalShipmentsIncludingArchived: allShipments.length,
      pendingArrivals,
      overdueShipments,
      inTransitShipments,
      averageDeliveryDays,
      onTimeDeliveryPercentage,
      transportModeStats,
      statusDistribution,
      archivedStats: {
        totalArchived: archivedShipments.length,
        completedShipments
      }
    };
  }, [activeShipments, archivedShipments]);

  return metrics;
};
