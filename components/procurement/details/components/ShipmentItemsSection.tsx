
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Package, PencilLine } from 'lucide-react';
import { formatDate } from '../../utils/shipmentUtils';
import type { ShipmentItem } from '@/hooks/useShipmentDetails';

interface ShipmentItemsSectionProps {
  items: ShipmentItem[];
  onEditItems: () => void;
}

const ShipmentItemsSection: React.FC<ShipmentItemsSectionProps> = ({ items, onEditItems }) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Shipment Items ({items.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditItems}
        >
          <PencilLine className="mr-2 h-4 w-4" />
          Edit Items
        </Button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-lg font-medium text-gray-600">No items in this shipment</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/5">Item Code</TableHead>
                <TableHead className="w-2/5">Description</TableHead>
                <TableHead className="w-1/6 text-right">Quantity</TableHead>
                <TableHead className="w-1/6">Base Unit</TableHead>
                <TableHead className="w-1/6 text-right">Direct Unit Cost</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item_code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.base_unit_code || '-'}</TableCell>
                  <TableCell className="text-right">
                    {item.direct_unit_cost != null 
                      ? item.direct_unit_cost.toFixed(2) 
                      : '-'}
                  </TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ShipmentItemsSection;
