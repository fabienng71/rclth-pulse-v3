
import React from "react";

export const ChartLoading: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-2">📊</div>
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    </div>
  );
};
