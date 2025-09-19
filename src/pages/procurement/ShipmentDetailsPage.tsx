
import React from 'react';
import Navigation from '@/components/Navigation';
import ShipmentDetails from '@/components/procurement/details/ShipmentDetails';
import { Toaster } from 'sonner';

const ShipmentDetailsPage: React.FC = () => {
  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="mb-6 section-background p-6">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Shipment Details</h1>
          <p className="text-muted-foreground text-xl">View detailed information about this shipment</p>
        </div>
        
        <ShipmentDetails />
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default ShipmentDetailsPage;
