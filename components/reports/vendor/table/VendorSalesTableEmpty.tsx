
import { ReactNode } from "react";

interface VendorSalesTableEmptyProps {
  isLoading: boolean;
  hasData: boolean;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
}

export const VendorSalesTableEmpty = ({ 
  isLoading, 
  hasData,
  loadingContent = <div className="flex justify-center p-6">Loading vendor data...</div>,
  emptyContent = <div className="flex justify-center p-6">No vendor data available for the selected period.</div>
}: VendorSalesTableEmptyProps) => {
  if (isLoading) {
    return <>{loadingContent}</>;
  }
  
  if (!hasData) {
    return <>{emptyContent}</>;
  }
  
  return null;
};
