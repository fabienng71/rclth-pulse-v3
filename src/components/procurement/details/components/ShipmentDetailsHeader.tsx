
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { UniversalBackButton } from '@/components/common/navigation';

interface ShipmentDetailsHeaderProps {
  shipmentId: string;
  onDeleteClick: () => void;
  onEditClick: () => void;
  onExportClick: () => void;
}

const ShipmentDetailsHeader: React.FC<ShipmentDetailsHeaderProps> = ({ 
  shipmentId, 
  onDeleteClick,
  onEditClick,
  onExportClick
}) => {
  const { isAdmin } = useAuthStore();
  
  return (
    <div className="flex justify-between items-center">
      <UniversalBackButton />
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onExportClick}
          disabled={!isAdmin}
          title={!isAdmin ? "Only administrators can export purchase orders" : "Export purchase order"}
        >
          <Download className="h-4 w-4 mr-2" />
          Export PO
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditClick}
          disabled={!isAdmin}
          title={!isAdmin ? "Only administrators can edit shipments" : "Edit shipment"}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Shipment
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDeleteClick}
          disabled={!isAdmin}
          title={!isAdmin ? "Only administrators can delete shipments" : "Delete shipment"}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Shipment
        </Button>
      </div>
    </div>
  );
};

export default ShipmentDetailsHeader;
