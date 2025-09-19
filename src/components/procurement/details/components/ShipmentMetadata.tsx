
import React from 'react';
import { formatDate } from '../../utils/shipmentUtils';
import type { Shipment } from '@/hooks/useShipments';
import TransportModeBadge from '../../transport/TransportModeBadge';

interface ShipmentMetadataProps {
  shipment: Shipment;
}

const ShipmentMetadata: React.FC<ShipmentMetadataProps> = ({ shipment }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Vendor Information</h4>
        <div className="space-y-1 text-sm">
          <p>Code: <span className="font-medium">{shipment.vendor_code}</span></p>
          <p>Freight Forwarder: <span className="font-medium">{shipment.freight_forwarder || 'None'}</span></p>
          <p className="flex items-center gap-1">
            Transport Mode: 
            <span className="font-medium flex items-center">
              <TransportModeBadge mode={shipment.transport_mode} />
            </span>
          </p>
        </div>
      </div>
      
      <div className="md:col-span-1">
        {/* Placeholder div if needed */}
      </div>
      
      <div className="text-right">
        <h4 className="text-sm font-medium mb-2">Shipping Dates</h4>
        <div className="space-y-1 text-sm">
          <p>ETD: <span className="font-medium">{shipment.etd ? formatDate(shipment.etd) : 'Not set'}</span></p>
          <p>ETA: <span className="font-medium">{shipment.eta ? formatDate(shipment.eta) : 'Not set'}</span></p>
          <p>Created: <span className="font-medium">{formatDate(shipment.created_at)}</span></p>
          <p>Updated: <span className="font-medium">{formatDate(shipment.updated_at)}</span></p>
        </div>
      </div>
    </div>
  );
};

export default ShipmentMetadata;
