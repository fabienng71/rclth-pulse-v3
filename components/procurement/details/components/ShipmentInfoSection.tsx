
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import ShipmentMetadata from './ShipmentMetadata';
import ShipmentEditForm from './ShipmentEditForm';
import type { Shipment } from '@/hooks/useShipments';

interface ShipmentInfoSectionProps {
  shipment: Shipment;
  editingShipment: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
  onEditSuccess: () => void;
}

const ShipmentInfoSection: React.FC<ShipmentInfoSectionProps> = ({
  shipment,
  editingShipment,
  onEditClick,
  onCancelEdit,
  onEditSuccess
}) => {
  return (
    <>
      {!editingShipment ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Shipment Information</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEditClick}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </Button>
          </div>
          <ShipmentMetadata shipment={shipment} />
        </>
      ) : (
        <div className="mt-4 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Shipment Details</h3>
          </div>
          <ShipmentEditForm 
            shipment={shipment} 
            onSuccess={onEditSuccess}
            onClose={onCancelEdit}
          />
        </div>
      )}
    </>
  );
};

export default ShipmentInfoSection;
