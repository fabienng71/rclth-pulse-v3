
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Snowflake, Sun, Thermometer } from 'lucide-react';

type ShipmentTypeBadgeProps = {
  shipmentType: string | null;
};

const ShipmentTypeBadge: React.FC<ShipmentTypeBadgeProps> = ({ shipmentType }) => {
  if (!shipmentType) return <span>-</span>;
  
  switch (shipmentType) {
    case 'Frozen':
      return (
        <Badge className="bg-blue-500 text-white hover:bg-blue-600 font-medium px-3 py-1">
          <Snowflake className="h-3 w-3 mr-1" /> Frozen
        </Badge>
      );
    case 'Chill':
      return (
        <Badge className="bg-cyan-500 text-white hover:bg-cyan-600 font-medium px-3 py-1">
          <Thermometer className="h-3 w-3 mr-1" /> Chill
        </Badge>
      );
    case 'Dry':
      return (
        <Badge className="bg-orange-500 text-white hover:bg-orange-600 font-medium px-3 py-1">
          <Sun className="h-3 w-3 mr-1" /> Dry
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 text-white hover:bg-gray-600 font-medium px-3 py-1">
          {shipmentType}
        </Badge>
      );
  }
};

export default ShipmentTypeBadge;
