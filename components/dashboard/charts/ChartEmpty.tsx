
import React from "react";
import { AlertCircle } from "lucide-react";

interface ChartEmptyProps {
  message?: string;
}

export const ChartEmpty: React.FC<ChartEmptyProps> = ({ 
  message = "No data available for chart" 
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
};
