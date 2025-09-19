
import React from 'react';
import { formatDate } from '@/lib/utils';

interface ReturnDetailsSectionProps {
  returnDate: string;
  returnQuantity: number;
  status: string;
}

const ReturnDetailsSection: React.FC<ReturnDetailsSectionProps> = ({
  returnDate,
  returnQuantity,
  status
}) => {
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
    <div className="space-y-3 md:text-right">
      <h2 className="font-semibold text-lg mb-4 md:text-right">Return Details</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="text-muted-foreground">Return Date:</div>
        <div className="font-medium">
          {formatDate(new Date(returnDate))}
        </div>
        
        <div className="text-muted-foreground">Quantity:</div>
        <div className="font-medium">{returnQuantity}</div>
        
        <div className="text-muted-foreground">Status:</div>
        <div className="font-medium">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getStatusBadgeClass(status)
          }`}>
            {status === 'draft' ? 'Draft' : 
             status === 'pending' ? 'Pending' : 
             status === 'approved' ? 'Approved' : 
             status === 'rejected' ? 'Rejected' : 
             status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailsSection;
