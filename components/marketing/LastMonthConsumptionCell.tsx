
import React from 'react';

interface LastMonthConsumptionCellProps {
  lastMonthConsumption: number;
  className?: string;
}

export const LastMonthConsumptionCell: React.FC<LastMonthConsumptionCellProps> = ({ 
  lastMonthConsumption, 
  className = "" 
}) => {
  const formatConsumption = (value: number) => {
    // Add null/undefined check
    if (value === null || value === undefined) return '-';
    if (value === 0) return '-';
    
    // Format with thousand separators, no decimals
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  return (
    <span className={className}>
      {formatConsumption(lastMonthConsumption)}
    </span>
  );
};
