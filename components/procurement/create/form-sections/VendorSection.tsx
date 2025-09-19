
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import VendorSearch from '../../search/VendorSearch';
import FreightForwarderField from '../../details/components/FreightForwarderField';
import { UseFormReturn } from 'react-hook-form';
import { ShipmentFormValues } from '@/types/shipment';

interface VendorSectionProps {
  form: UseFormReturn<ShipmentFormValues>;
  onVendorSelect: (vendor: { vendor_code: string, vendor_name: string }) => void;
}

const VendorSection: React.FC<VendorSectionProps> = ({ form, onVendorSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Vendor Information</h3>
      
      <FormField
        control={form.control}
        name="vendor_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor</FormLabel>
            <FormControl>
              <VendorSearch 
                onSelect={onVendorSelect} 
                selectedVendorCode={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FreightForwarderField control={form.control} />
    </div>
  );
};

export default VendorSection;
