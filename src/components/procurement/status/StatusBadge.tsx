
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertTriangle, PackageCheck, PackagePlus } from 'lucide-react';

type StatusBadgeProps = {
  status: string | null;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return <span>-</span>;
  
  switch (status.toLowerCase()) {
    case 'in_transit':
      return (
        <Badge className="bg-blue-500 text-white hover:bg-blue-600 font-medium px-3 py-1">
          <Clock className="h-3 w-3 mr-1" /> In Transit
        </Badge>
      );
    case 'delivered':
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-600 font-medium px-3 py-1">
          <CheckCircle className="h-3 w-3 mr-1" /> Delivered
        </Badge>
      );
    case 'delayed':
      return (
        <Badge className="bg-amber-500 text-white hover:bg-amber-600 font-medium px-3 py-1">
          <AlertTriangle className="h-3 w-3 mr-1" /> Delayed
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-purple-500 text-white hover:bg-purple-600 font-medium px-3 py-1">
          <PackagePlus className="h-3 w-3 mr-1" /> Pending
        </Badge>
      );
    case 'unknown':
      return (
        <Badge className="bg-gray-500 text-white hover:bg-gray-600 font-medium px-3 py-1">
          Unknown
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 text-white hover:bg-gray-600 font-medium px-3 py-1">
          {status}
        </Badge>
      );
  }
};

export default StatusBadge;
