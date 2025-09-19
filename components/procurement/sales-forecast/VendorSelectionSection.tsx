
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VendorSearch from '@/components/procurement/search/VendorSearch';

interface SelectedVendor {
  vendor_code: string;
  vendor_name: string;
}

interface VendorSelectionSectionProps {
  selectedVendor: SelectedVendor | null;
  onVendorSelect: (vendor: SelectedVendor) => void;
}

export const VendorSelectionSection: React.FC<VendorSelectionSectionProps> = ({
  selectedVendor,
  onVendorSelect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Select Vendor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose a vendor to forecast for:
            </label>
            <VendorSearch
              selectedVendorCode={selectedVendor?.vendor_code}
              onSelect={onVendorSelect}
            />
          </div>
          
          {selectedVendor && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Selected vendor:</p>
              <p className="font-medium">
                {selectedVendor.vendor_name} ({selectedVendor.vendor_code})
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
