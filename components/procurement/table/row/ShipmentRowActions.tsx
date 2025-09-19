
import React from 'react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Shipment } from '@/hooks/useShipments';

interface ShipmentRowActionsProps {
  shipment: Shipment;
  onArchiveToggle: () => void;
  onDeleteClick: () => void;
  isProcessing: boolean;
  isAdmin: boolean;
}

const ShipmentRowActions: React.FC<ShipmentRowActionsProps> = ({
  shipment,
  onArchiveToggle,
  onDeleteClick,
  isProcessing,
  isAdmin
}) => {
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation();
          onArchiveToggle();
        }}
        disabled={isProcessing}
        className="action-button h-8 w-8"
        title={shipment.archive ? "Unarchive shipment" : "Archive shipment"}
      >
        {shipment.archive ? (
          <ArchiveRestore className="h-4 w-4" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick();
        }}
        disabled={isProcessing}
        className="action-button h-8 w-8 text-destructive hover:text-destructive"
        title="Delete shipment"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ShipmentRowActions;
