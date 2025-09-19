
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface ReturnRequest {
  id: string;
  customer_code: string;
  product_code: string;
  return_quantity: number;
  return_date: string;
  reason: string;
  comment: string | null;
  status: string;
  created_at: string;
}

interface ReturnRequestPreviewProps {
  request: ReturnRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReturnRequestPreview: React.FC<ReturnRequestPreviewProps> = ({
  request,
  open,
  onOpenChange
}) => {
  if (!request) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Return Request Details</DialogTitle>
          <DialogDescription>
            Preview of the return request information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Customer Code</p>
              <p className="text-base">{request.customer_code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Product Code</p>
              <p className="text-base">{request.product_code}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Return Quantity</p>
              <p className="text-base">{request.return_quantity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Return Date</p>
              <p className="text-base">{formatDate(new Date(request.return_date))}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Reason</p>
            <p className="text-base">{request.reason}</p>
          </div>
          
          {request.comment && (
            <div>
              <p className="text-sm font-medium text-gray-500">Comments</p>
              <p className="text-base">{request.comment}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getStatusBadgeClass(request.status)
            }`}>
              {request.status === 'draft' ? 'Draft' : 
               request.status === 'pending' ? 'Pending' : 
               request.status === 'approved' ? 'Approved' : 
               request.status === 'rejected' ? 'Rejected' : 
               request.status}
            </span>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Created At</p>
            <p className="text-base">{formatDate(new Date(request.created_at))}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestPreview;
