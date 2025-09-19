
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import type { Shipment } from '@/hooks/useShipments';
import ShipmentTableHeader from './ShipmentTableHeader';
import ShipmentRow from './ShipmentRow';
import type { SortDirection } from '@/hooks/useSortableTable';

// Define SortableField type to match what's used in ShipmentTableHeader
type SortableField = 'vendor_name' | 'transport_mode' | 'etd' | 'eta' | 'created_at' | 'status';

interface TableContainerProps {
  shipments: Shipment[];
  sortField: string;
  sortDirection: SortDirection;
  handleSort: (field: SortableField) => void;
  refetch: () => void;
}

const TableContainer: React.FC<TableContainerProps> = ({
  shipments,
  sortField,
  sortDirection,
  handleSort,
  refetch
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <ShipmentTableHeader 
          sortField={sortField as SortableField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <TableBody>
          {shipments.map((shipment) => (
            <ShipmentRow 
              key={shipment.id} 
              shipment={shipment}
              refetch={refetch} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TableContainer;
