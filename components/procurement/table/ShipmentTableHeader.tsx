
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface ShipmentTableHeaderProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const ShipmentTableHeader: React.FC<ShipmentTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort
}) => {
  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button 
      variant="ghost" 
      onClick={() => onSort(field)}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-1/5">
          <SortableHeader field="vendor_name">Vendor & Forwarder</SortableHeader>
        </TableHead>
        <TableHead className="w-1/5">
          <SortableHeader field="etd">ETD / ETA</SortableHeader>
        </TableHead>
        <TableHead className="text-center w-1/12">
          <SortableHeader field="status">Type & Status</SortableHeader>
        </TableHead>
        <TableHead className="text-center w-1/12">
          <SortableHeader field="transport_mode">Transport</SortableHeader>
        </TableHead>
        <TableHead className="text-center w-1/12">Items</TableHead>
        <TableHead className="w-1/8">
          <SortableHeader field="created_at">Created</SortableHeader>
        </TableHead>
        <TableHead className="text-center w-1/8">Days</TableHead>
        <TableHead className="text-center w-1/12">Todo</TableHead>
        <TableHead className="text-right w-1/12">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ShipmentTableHeader;
