
import React from 'react';
import { getDaysInfo } from '../../utils/shipmentUtils';
import DaysInfoBadge from '../../dates/DaysInfoBadge';

interface ShipmentDaysBadgesProps {
  etd: string | null;
  eta: string | null;
}

const ShipmentDaysBadges: React.FC<ShipmentDaysBadgesProps> = ({ etd, eta }) => {
  const etdDaysInfo = getDaysInfo(etd, 'departure');
  const etaDaysInfo = getDaysInfo(eta, 'arrival');

  return (
    <div className="flex flex-col space-y-1 items-center">
      {etdDaysInfo && (
        <DaysInfoBadge 
          status={etdDaysInfo.status} 
          days={etdDaysInfo.days} 
          type="departure" 
        />
      )}
      {etaDaysInfo && (
        <DaysInfoBadge 
          status={etaDaysInfo.status} 
          days={etaDaysInfo.days} 
          type="arrival" 
        />
      )}
    </div>
  );
};

export default ShipmentDaysBadges;
