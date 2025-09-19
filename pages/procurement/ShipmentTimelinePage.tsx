
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalBackButton, UniversalBreadcrumb } from '@/components/common/navigation';
import ShipmentTimeline from '@/components/procurement/timeline/ShipmentTimeline';

const ShipmentTimelinePage = () => {
  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6">
          <UniversalBackButton customPath="/procurement" customLabel="Back to Dashboard" />
          <UniversalBreadcrumb />
          <div className="section-background p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Shipment Timeline
                </h1>
                <p className="text-muted-foreground text-xl">
                  View and manage shipments on a monthly timeline
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shipments Timeline</CardTitle>
            <CardDescription>
              Track your shipments with ETD and ETA dates on a visual timeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShipmentTimeline />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShipmentTimelinePage;
