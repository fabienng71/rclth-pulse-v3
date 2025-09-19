import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReturnRequestExpandedDetailsProps {
  request: {
    id: string;
    customer_code: string;
    return_date: string;
    priority: string;
    notes?: string;
  };
  itemDetails: Record<string, unknown[]>;
  formatDate: (dateString: string) => string;
}

export const ReturnRequestExpandedDetails: React.FC<ReturnRequestExpandedDetailsProps> = ({
  request,
  itemDetails,
  formatDate,
}) => {
  return (
    <TableCell colSpan={9} className="bg-muted/30 p-4">
      <div className="space-y-4">
        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Request Details</h4>
            <div className="space-y-1 text-sm">
              <div><strong>Customer Code:</strong> {request.customer_code}</div>
              <div><strong>Return Date:</strong> {formatDate(request.return_date)}</div>
              <div><strong>Priority:</strong> {request.priority}</div>
            </div>
          </div>
          
          {request.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{request.notes}</p>
            </div>
          )}
        </div>
        
        {/* Items List */}
        <div>
          <h4 className="font-medium mb-2">Items to Return</h4>
          {itemDetails[request.id] ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemDetails[request.id].map((item: Record<string, unknown>) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit || '-'}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </div>
    </TableCell>
  );
};