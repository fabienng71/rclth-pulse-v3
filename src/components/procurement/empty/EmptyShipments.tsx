
import React from 'react';
import { Ship } from 'lucide-react';

const EmptyShipments: React.FC = () => {
  return (
    <div className="rounded-md border p-8 flex flex-col items-center justify-center">
      <Ship className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No shipments to display</h3>
      <p className="text-sm text-muted-foreground mt-1">
        No shipment records found in the database
      </p>
    </div>
  );
};

export default EmptyShipments;
