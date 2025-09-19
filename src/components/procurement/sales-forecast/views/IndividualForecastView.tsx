import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { VendorSelectionSection } from '../VendorSelectionSection';
import { UnifiedForecastTable } from '../UnifiedForecastTable';

interface SelectedVendor {
  vendor_code: string;
  vendor_name: string;
}

interface IndividualForecastViewProps {
  selectedVendor: SelectedVendor | null;
  onVendorSelect: (vendor: SelectedVendor) => void;
  onReset: () => void;
}

export const IndividualForecastView: React.FC<IndividualForecastViewProps> = ({
  selectedVendor,
  onVendorSelect,
  onReset
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Individual Sales Forecast</h3>
        <Button variant="outline" onClick={onReset}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Start
        </Button>
      </div>

      <VendorSelectionSection 
        selectedVendor={selectedVendor}
        onVendorSelect={onVendorSelect}
      />

      {selectedVendor && (
        <UnifiedForecastTable 
          vendor={selectedVendor}
          onReset={onReset}
          isCollaborative={false}
        />
      )}
    </div>
  );
};