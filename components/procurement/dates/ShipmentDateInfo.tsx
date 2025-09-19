
import React from 'react';
import { Calendar } from 'lucide-react';

type ShipmentDateInfoProps = {
  label: string;
  formattedDate: string;
};

const ShipmentDateInfo: React.FC<ShipmentDateInfoProps> = ({ label, formattedDate }) => {
  return (
    <div className="flex items-start space-y-1 flex-col">
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
        <span className="font-medium">{label}:</span>
      </div>
      <span>{formattedDate}</span>
    </div>
  );
};

export default ShipmentDateInfo;
