
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ShipmentWithItems } from '@/hooks/useIncomingStock';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import IncomingStockRow from './IncomingStockRow';

interface IncomingStockTableProps {
  shipments: ShipmentWithItems[];
}

const IncomingStockTable: React.FC<IncomingStockTableProps> = ({ shipments }) => {
  const { navigateWithContext } = useNavigationHistory();

  const handleShipmentClick = (shipmentId: string) => {
    navigateWithContext(`/procurement/${shipmentId}`, {
      fromLabel: 'Back to Incoming Stock'
    });
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Shipment ID</TableHead>
            <TableHead className="w-[120px]">Transport</TableHead>
            <TableHead className="w-[100px]">ETD</TableHead>
            <TableHead className="w-[100px]">ETA</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px]">Days Until Arrival</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <IncomingStockRow 
              key={shipment.id} 
              shipment={shipment}
              onClick={() => handleShipmentClick(shipment.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default IncomingStockTable;
