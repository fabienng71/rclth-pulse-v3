
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, AlertTriangle, Truck } from 'lucide-react';
import type { VendorGroup } from '@/hooks/useIncomingStock';

interface IncomingStockSummaryCardsProps {
  vendorGroups: VendorGroup[];
  loading: boolean;
}

const IncomingStockSummaryCards: React.FC<IncomingStockSummaryCardsProps> = ({
  vendorGroups,
  loading
}) => {
  const totalShipments = vendorGroups.reduce((sum, group) => sum + group.totalShipments, 0);
  const totalItems = vendorGroups.reduce((sum, group) => sum + group.totalItems, 0);
  const urgentShipments = vendorGroups.reduce((sum, group) => sum + group.urgentShipments, 0);
  const totalVendors = vendorGroups.length;

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalShipments}</div>
          <p className="text-xs text-muted-foreground">Pending & In Transit</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">Items incoming</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Urgent Shipments</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{urgentShipments}</div>
          <p className="text-xs text-muted-foreground">Arriving ≤3 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVendors}</div>
          <p className="text-xs text-muted-foreground">With incoming stock</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomingStockSummaryCards;
