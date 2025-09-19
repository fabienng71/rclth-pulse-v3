
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableCellText,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export interface ReturnRequest {
  id: string;
  customer_code: string;
  product_code: string;
  return_quantity: number;
  return_date: string;
  reason: string;
  comment: string | null;
  status: string;
  created_at: string;
  deleted?: boolean;
  full_name: string | null;
  customers?: {
    search_name: string | null;
    customer_name: string;
  } | null;
  items?: {
    description: string | null;
  } | null;
}

interface ReturnRequestTableProps {
  returnRequests: ReturnRequest[];
  loading: boolean;
  deleteInProgress: boolean;
  onViewRequest: (id: string) => void;
  onEditRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  formatDate: (dateString: string) => string;
  getStatusBadgeClass: (status: string) => string;
}

const ReturnRequestTable = ({
  returnRequests,
  loading,
  deleteInProgress,
  onViewRequest,
  onEditRequest,
  onDeleteRequest,
  formatDate,
  getStatusBadgeClass
}: ReturnRequestTableProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (returnRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No return requests found</p>
        <Button onClick={() => navigate('/forms/return/submit')} variant="outline" className="mt-4">
          Create your first request
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Description</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returnRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCellText 
                value={
                  request.items?.description || 
                  request.product_code
                } 
              />
              <TableCellText 
                value={
                  request.customers?.search_name || 
                  request.customers?.customer_name || 
                  request.customer_code
                } 
              />
              <TableCell>{request.return_quantity}</TableCell>
              <TableCell>{formatDate(request.return_date)}</TableCell>
              <TableCellText value={request.reason} />
              <TableCellText value={request.full_name || 'Unknown'} />
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getStatusBadgeClass(request.status)
                }`}>
                  {request.status === 'draft' ? 'Draft' : 
                   request.status === 'pending' ? 'Pending' : 
                   request.status === 'approved' ? 'Approved' : 
                   request.status === 'rejected' ? 'Rejected' : 
                   request.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewRequest(request.id);
                    }}
                    title="View details"
                  >
                    <Eye className="h-4 w-4 text-gray-500 hover:text-primary" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditRequest(request.id);
                    }}
                    title="Edit request"
                  >
                    <Edit className="h-4 w-4 text-gray-500 hover:text-primary" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRequest(request.id);
                    }}
                    disabled={deleteInProgress}
                    title="Delete request"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReturnRequestTable;
