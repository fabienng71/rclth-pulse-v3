
import React from 'react';

const LoadingShipments: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="text-center">
        <div className="text-2xl mb-2">🚢</div>
        <p className="text-lg text-muted-foreground">Loading shipments...</p>
      </div>
    </div>
  );
};

export default LoadingShipments;
