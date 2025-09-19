
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReturnRequestHeaderProps {
  id: string;
  status: string;
  onAddLogo: () => void;
  onPrint: () => void;
}

const ReturnRequestHeader: React.FC<ReturnRequestHeaderProps> = ({
  id,
  status,
  onAddLogo,
  onPrint
}) => {
  const navigate = useNavigate();

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
    <>
      <Button variant="outline" size="sm" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Return Requests
      </Button>
      
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold md:text-3xl">Return Request Details</h1>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getStatusBadgeClass(status)
            }`}>
              {status === 'draft' ? 'Draft' : 
               status === 'pending' ? 'Pending' : 
               status === 'approved' ? 'Approved' : 
               status === 'rejected' ? 'Rejected' : 
               status}
            </span>
            <span className="text-muted-foreground">
              {id.slice(0, 8)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onAddLogo}
          >
            <Image className="h-4 w-4" />
            Add Logo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
            Print Form
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/forms/return/edit/${id}`}>
              Edit
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ReturnRequestHeader;
