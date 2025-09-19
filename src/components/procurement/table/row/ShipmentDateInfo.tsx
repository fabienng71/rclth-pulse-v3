
import React from 'react';
import { formatDateWithLabel } from '../../utils/shipmentUtils';
import ShipmentDateInfo from '../../dates/ShipmentDateInfo';

interface ShipmentDateInfoProps {
  etd: string | null;
  eta: string | null;
}

const ShipmentDateDisplay: React.FC<ShipmentDateInfoProps> = ({ etd, eta }) => {
  const etdInfo = formatDateWithLabel('ETD', etd);
  const etaInfo = formatDateWithLabel('ETA', eta);

  return (
    <div className="space-y-3">
      {etdInfo && <ShipmentDateInfo label={etdInfo.label} formattedDate={etdInfo.formattedDate} />}
      {etaInfo && <ShipmentDateInfo label={etaInfo.label} formattedDate={etaInfo.formattedDate} />}
    </div>
  );
};

export default ShipmentDateDisplay;
