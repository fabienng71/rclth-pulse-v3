
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ListTodo } from 'lucide-react';
import type { Shipment } from '@/hooks/useShipments';
import { formatDate } from '../utils/shipmentUtils';
import { determineShipmentStatus } from '../utils/shipmentUtils';
import StatusBadge from '../status/StatusBadge';
import ShipmentTypeBadge from '../type/ShipmentTypeBadge';
import TransportModeBadge from '../transport/TransportModeBadge';
import ShipmentItems from '../items/ShipmentItems';
import { useAuthStore } from '@/stores/authStore';
import ShipmentDateDisplay from './row/ShipmentDateInfo';
import ShipmentRowActions from './row/ShipmentRowActions';
import DeleteShipmentDialog from './dialogs/DeleteShipmentDialog';
import { useShipmentRowActions } from './hooks/useShipmentRowActions';
import ShipmentDaysBadges from './row/ShipmentDaysBadges';
import { useShipmentTodos } from '@/hooks/useShipmentTodos';

interface ShipmentRowProps {
  shipment: Shipment;
  refetch: () => void;
}

const ShipmentRow: React.FC<ShipmentRowProps> = ({ shipment, refetch }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { todo } = useShipmentTodos(shipment.id);
  
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    isProcessing,
    handleDelete,
    handleArchiveToggle
  } = useShipmentRowActions(shipment, refetch);
  
  // Always use calculated status instead of database status
  const calculatedStatus = determineShipmentStatus(shipment.etd, shipment.eta);
  
  const handleRowClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.action-button')) {
      navigate(`/procurement/${shipment.id}`);
    }
  };

  const handleTodoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/procurement/shipments/${shipment.id}/todo`);
  };

  // Only show todo for pending and in_transit shipments based on calculated status
  const showTodo = calculatedStatus === 'pending' || calculatedStatus === 'in_transit';

  return (
    <>
      <TableRow 
        className="hover:bg-muted/30 cursor-pointer"
        onClick={handleRowClick}
      >
        <TableCell className="w-1/5">
          <div className="font-medium">{shipment.vendor_name}</div>
          <div className="text-sm text-muted-foreground">{shipment.freight_forwarder || 'No freight forwarder'}</div>
        </TableCell>
        
        <TableCell className="w-1/5">
          <ShipmentDateDisplay etd={shipment.etd} eta={shipment.eta} />
        </TableCell>
        
        <TableCell className="text-center w-1/12">
          <div className="flex flex-col gap-1">
            <ShipmentTypeBadge shipmentType={shipment.shipment_type} />
            <StatusBadge status={calculatedStatus} />
          </div>
        </TableCell>
        
        <TableCell className="text-center w-1/12">
          <TransportModeBadge mode={shipment.transport_mode} />
        </TableCell>
        
        <TableCell className="text-center w-1/12">
          <ShipmentItems shipmentId={shipment.id} />
        </TableCell>
        
        <TableCell className="w-1/8">
          {formatDate(shipment.created_at)}
        </TableCell>
        
        <TableCell className="text-center w-1/8">
          <ShipmentDaysBadges etd={shipment.etd} eta={shipment.eta} />
        </TableCell>
        
        <TableCell className="text-center w-1/12">
          {showTodo && todo && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTodoClick}
                className="action-button flex items-center gap-1"
              >
                <ListTodo className="h-3 w-3" />
                {todo.completionStats.completed}/{todo.completionStats.total}
              </Button>
              {todo.allTasksCompleted && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
          )}
          {showTodo && !todo && isAdmin && (
            <span className="text-xs text-muted-foreground">No todo</span>
          )}
        </TableCell>
        
        <TableCell className="text-right w-1/12">
          <ShipmentRowActions
            shipment={shipment}
            onArchiveToggle={handleArchiveToggle}
            onDeleteClick={() => setDeleteDialogOpen(true)}
            isProcessing={isProcessing}
            isAdmin={isAdmin}
          />
        </TableCell>
      </TableRow>

      <DeleteShipmentDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default ShipmentRow;
