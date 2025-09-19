
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ForecastTrendIconProps {
  trend: string;
}

const ForecastTrendIcon: React.FC<ForecastTrendIconProps> = ({ trend }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {getTrendIcon(trend)}
      <span className="capitalize text-sm">{trend}</span>
    </div>
  );
};

export default ForecastTrendIcon;
