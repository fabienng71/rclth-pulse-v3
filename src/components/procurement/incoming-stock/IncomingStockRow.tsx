
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import StatusBadge from '@/components/procurement/status/StatusBadge';
import TransportModeBadge from '@/components/procurement/transport/TransportModeBadge';
import { formatDate, getDaysInfo, determineShipmentStatus } from '@/components/procurement/utils/shipmentUtils';
import ShipmentItemsDisplay from './ShipmentItemsDisplay';
import type { ShipmentWithItems } from '@/hooks/useIncomingStock';

interface IncomingStockRowProps {
  shipment: ShipmentWithItems;
  onClick: () => void;
}

const IncomingStockRow: React.FC<IncomingStockRowProps> = ({ shipment, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = determineShipmentStatus(shipment.etd, shipment.eta);
  const daysInfo = getDaysInfo(shipment.eta, 'arrival');

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    setIsExpanded(!isExpanded);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the expand toggle
    onClick();
  };

  const getDaysBadge = () => {
    if (!daysInfo) return null;

    let badgeColor = '';
    let text = '';

    if (daysInfo.status === 'overdue') {
      badgeColor = 'bg-red-500 text-white';
      text = `${daysInfo.days} days overdue`;
    } else if (daysInfo.days <= 3) {
      badgeColor = 'bg-orange-500 text-white';
      text = `${daysInfo.days} days`;
    } else if (daysInfo.days <= 7) {
      badgeColor = 'bg-yellow-500 text-white';
      text = `${daysInfo.days} days`;
    } else {
      badgeColor = 'bg-green-500 text-white';
      text = `${daysInfo.days} days`;
    }

    return (
      <Badge className={badgeColor}>
        {text}
      </Badge>
    );
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandToggle}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            <span>{shipment.id.slice(0, 8)}...</span>
          </div>
        </TableCell>
        <TableCell>
          <TransportModeBadge mode={shipment.transport_mode} />
        </TableCell>
        <TableCell>
          {formatDate(shipment.etd) || '-'}
        </TableCell>
        <TableCell>
          {formatDate(shipment.eta) || '-'}
        </TableCell>
        <TableCell>
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium">{shipment.itemsCount} items</span>
              {shipment.itemsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {isExpanded ? 'Hide' : 'Show'} Details
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {shipment.itemsDescription}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <StatusBadge status={status} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {getDaysBadge() || '-'}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              className="p-1 h-6 w-6"
              title="View shipment details"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={7} className="p-0">
            <ShipmentItemsDisplay 
              items={shipment.items} 
              shipmentId={shipment.id}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default IncomingStockRow;
