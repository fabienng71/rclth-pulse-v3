
import React from 'react';
import VendorSearch from '@/components/procurement/search/VendorSearch';

interface Props {
  vendor: { vendor_code: string; vendor_name: string } | null;
  setVendor: (vendor: { vendor_code: string; vendor_name: string }) => void;
  disabled: boolean;
}

const ClaimVendorSection: React.FC<Props> = ({ vendor, setVendor, disabled }) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1">Vendor <span className="text-destructive">*</span></label>
    <VendorSearch onSelect={setVendor} selectedVendorCode={vendor?.vendor_code} />
  </div>
);

export default ClaimVendorSection;
