
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Truck, ClipboardCheck, List } from 'lucide-react';
import { useShipments } from '@/hooks/useShipments';
import { ProcurementDashboard as DashboardMetrics } from '@/components/procurement/dashboard/ProcurementDashboard';
import { useAuthStore } from '@/stores/authStore';
import QuickActionsSection from '@/components/procurement/dashboard/QuickActionsSection';
import DashboardNavigation from '@/components/procurement/dashboard/DashboardNavigation';
import IncomingShipmentsWidget from '@/components/procurement/dashboard/IncomingShipmentsWidget';

const ProcurementDashboard = () => {
  // Fetch ALL shipments for dashboard metrics (both active and archived)
  const { shipments, loading, error } = useShipments(true);
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6 section-background p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Procurement Dashboard</h1>
              <p className="text-muted-foreground text-xl">Monitor and manage procurement activities</p>
            </div>
            
            {/* Header Metrics */}
            <div className="flex-shrink-0">
              <DashboardMetrics 
                shipments={shipments} 
                loading={loading} 
                includeArchived={true} 
                headerMode={true}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Quick Actions */}
          <QuickActionsSection isAdmin={isAdmin} />

          {/* Navigation Cards */}
          <DashboardNavigation />

          {/* Incoming Shipments This Week */}
          <IncomingShipmentsWidget shipments={shipments} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
