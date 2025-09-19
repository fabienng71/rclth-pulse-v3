import React from 'react';
import { 
  Truck, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Plane,
  Ship
} from 'lucide-react';
import type { Shipment } from '@/hooks/useShipments';
import { useProcurementDashboard } from '@/hooks/useProcurementDashboard';
import { useProcurementDashboardEnhanced } from '@/hooks/useProcurementDashboardEnhanced';
import { StatCard } from './StatCard';

interface ProcurementDashboardProps {
  shipments: Shipment[];
  loading?: boolean;
  includeArchived?: boolean;
  headerMode?: boolean;
}

export const ProcurementDashboard: React.FC<ProcurementDashboardProps> = ({
  shipments,
  loading = false,
  includeArchived = false,
  headerMode = false
}) => {
  // Separate active and archived shipments
  const activeShipments = shipments.filter(s => !s.archive);
  const archivedShipments = shipments.filter(s => s.archive);
  
  console.log(`[ProcurementDashboard] Shipments breakdown:`, {
    total: shipments.length,
    active: activeShipments.length,
    archived: archivedShipments.length,
    includeArchived
  });
  
  // Use enhanced metrics when including archived shipments
  const enhancedMetrics = useProcurementDashboardEnhanced(activeShipments, includeArchived ? archivedShipments : []);
  const basicMetrics = useProcurementDashboard(activeShipments);
  
  const metrics = includeArchived ? enhancedMetrics : basicMetrics;

  console.log(`[ProcurementDashboard] Using ${includeArchived ? 'enhanced' : 'basic'} metrics:`, {
    transportModeStats: metrics.transportModeStats
  });

  if (loading) {
    return (
      <div className={headerMode ? "flex gap-2" : "grid gap-2 grid-cols-5 mb-4"}>
        {[...Array(headerMode ? 3 : 10)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  // Header mode - show only 3 key metrics in a horizontal layout
  if (headerMode) {
    return (
      <div className="flex gap-2">
        <StatCard
          title="Total Shipments"
          value={metrics.totalShipments}
          icon={Truck}
          subtitle="Active shipments"
          className="min-w-[140px]"
        />
        
        <StatCard
          title="Pending Arrivals"
          value={metrics.pendingArrivals}
          icon={Calendar}
          subtitle="Expected deliveries"
          className={`min-w-[140px] ${metrics.pendingArrivals > 0 ? "border-blue-200" : ""}`}
        />
        
        <StatCard
          title="In Transit"
          value={metrics.inTransitShipments}
          icon={Clock}
          subtitle="Currently shipping"
          className={`min-w-[140px] ${metrics.inTransitShipments > 0 ? "border-orange-200" : ""}`}
        />
      </div>
    );
  }

  // Full dashboard mode - show all metrics (for other pages if needed)
  return (
    <div className="space-y-2 mb-4">
      {/* Main Metrics Row */}
      <div className="grid gap-2 grid-cols-5">
        <StatCard
          title="Total Shipments"
          value={metrics.totalShipments}
          icon={Truck}
          subtitle="Active shipments"
        />
        
        <StatCard
          title="Pending Arrivals"
          value={metrics.pendingArrivals}
          icon={Calendar}
          subtitle="Expected deliveries"
          className={metrics.pendingArrivals > 0 ? "border-blue-200" : ""}
        />
        
        <StatCard
          title="Overdue Shipments"
          value={metrics.overdueShipments}
          icon={AlertTriangle}
          subtitle="Past due date"
          className={metrics.overdueShipments > 0 ? "border-red-200" : ""}
          badge={metrics.overdueShipments > 0 ? {
            text: "Attention",
            variant: "destructive"
          } : undefined}
        />
        
        <StatCard
          title="In Transit"
          value={metrics.inTransitShipments}
          icon={Clock}
          subtitle="Currently shipping"
          className={metrics.inTransitShipments > 0 ? "border-orange-200" : ""}
        />

        <StatCard
          title="Avg Delivery"
          value={`${metrics.averageDeliveryDays}d`}
          icon={TrendingUp}
          subtitle="End to end"
        />
      </div>

      {/* Performance Metrics Row */}
      <div className="grid gap-2 grid-cols-5">
        <StatCard
          title="On-Time"
          value={`${metrics.onTimeDeliveryPercentage}%`}
          icon={CheckCircle}
          subtitle="Delivery rate"
          className={metrics.onTimeDeliveryPercentage >= 90 ? "border-green-200" : 
                    metrics.onTimeDeliveryPercentage >= 75 ? "border-yellow-200" : "border-red-200"}
        />
        
        <StatCard
          title="Air Transport"
          value={metrics.transportModeStats.air}
          icon={Plane}
          subtitle={`${Math.round((metrics.transportModeStats.air / Math.max(metrics.transportModeStats.total, 1)) * 100)}%`}
        />
        
        <StatCard
          title="Sea Transport"
          value={metrics.transportModeStats.sea}
          icon={Ship}
          subtitle={`${Math.round((metrics.transportModeStats.sea / Math.max(metrics.transportModeStats.total, 1)) * 100)}%`}
        />

        <StatCard
          title="Land Transport"
          value={metrics.transportModeStats.land}
          icon={Truck}
          subtitle={`${Math.round((metrics.transportModeStats.land / Math.max(metrics.transportModeStats.total, 1)) * 100)}%`}
        />

        <StatCard
          title="Delivered"
          value={metrics.statusDistribution.delivered}
          icon={CheckCircle}
          subtitle="Completed"
          className="border-green-200"
        />
      </div>
    </div>
  );
};
