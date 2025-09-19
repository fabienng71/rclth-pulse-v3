
import React from 'react';
import { MTDDayData } from '@/hooks/useMTDData';

interface MTDTableRowProps {
  day: MTDDayData;
}

export const MTDTableRow: React.FC<MTDTableRowProps> = ({ day }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatVariance = (variance: number) => {
    const formatted = Math.abs(variance).toFixed(1);
    return variance >= 0 ? `+${formatted}%` : `-${formatted}%`;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getRowClassName = () => {
    let className = 'border-b hover:bg-gray-50';
    if (day.is_weekend) {
      className += ' bg-gray-100';
    }
    if (day.is_holiday) {
      className += ' bg-yellow-50';
    }
    return className;
  };

  return (
    <tr key={day.day_of_month} className={getRowClassName()}>
      <td className="p-3 font-medium">{day.day_of_month}</td>
      <td className="p-3">{day.weekday_name}</td>
      <td className="p-3 text-right font-mono">
        {formatCurrency(day.current_year_sales)}
      </td>
      <td className="p-3 text-right font-mono">
        {formatCurrency(day.previous_year_sales)}
      </td>
      <td className="p-3 text-right font-mono">
        {formatCurrency(day.running_total_current_year)}
      </td>
      <td className="p-3 text-right font-mono">
        {formatCurrency(day.running_total_previous_year)}
      </td>
      <td className={`p-3 text-right font-medium ${getVarianceColor(day.variance_percent)}`}>
        {formatVariance(day.variance_percent)}
      </td>
    </tr>
  );
};
