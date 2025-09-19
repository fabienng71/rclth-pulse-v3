
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DaysInfoStatus } from '../utils/shipmentUtils';

type DaysInfoBadgeProps = {
  status: DaysInfoStatus;
  days: number;
  type: 'departure' | 'arrival';
};

const DaysInfoBadge: React.FC<DaysInfoBadgeProps> = ({ status, days, type }) => {
  if (status === 'upcoming') {
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        {days} days to {type}
      </Badge>
    );
  } else if (status === 'none') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Today
      </Badge>
    );
  } else {
    // Overdue
    const verb = type === 'departure' ? 'Departed' : 'Arrived';
    
    // Color based on how long ago
    let colorClass = '';
    if (days <= 7) {
      colorClass = 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    } else if (days <= 20) {
      colorClass = 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    } else {
      colorClass = 'bg-red-100 text-red-800 hover:bg-red-100';
    }
    
    return (
      <Badge className={colorClass}>
        {verb} {days} days ago
      </Badge>
    );
  }
};

export default DaysInfoBadge;
