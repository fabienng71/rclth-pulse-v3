
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Ship, Plane, Package } from 'lucide-react';

type TransportModeBadgeProps = {
  mode: string | null;
};

const TransportModeBadge: React.FC<TransportModeBadgeProps> = ({ mode }) => {
  if (!mode) return <span>-</span>;
  
  switch (mode.toLowerCase()) {
    case 'sea':
      return (
        <Badge className="bg-blue-500 text-white hover:bg-blue-600 font-medium px-3 py-1">
          <Ship className="h-3 w-3 mr-1" /> Sea
        </Badge>
      );
    case 'air':
      return (
        <Badge className="bg-purple-500 text-white hover:bg-purple-600 font-medium px-3 py-1">
          <Plane className="h-3 w-3 mr-1" /> Air
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 text-white hover:bg-gray-600 font-medium px-3 py-1">
          <Package className="h-3 w-3 mr-1" /> {mode}
        </Badge>
      );
  }
};

export default TransportModeBadge;
