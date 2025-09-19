
import React from "react";

interface ChartErrorProps {
  message?: string;
}

export const ChartError: React.FC<ChartErrorProps> = ({ 
  message = "Failed to load chart data" 
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-destructive text-sm">{message}</p>
    </div>
  );
};
