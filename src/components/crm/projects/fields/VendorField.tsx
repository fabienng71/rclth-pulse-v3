
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { useVendorsData } from '@/hooks/useVendorsData';
import { useEffect } from 'react';

export const VendorField = () => {
  const { control, setValue, watch } = useFormContext();
  const { vendors, isLoading } = useVendorsData();
  const vendorCode = watch('vendor_code');
  const vendorName = watch('vendor_name');

  useEffect(() => {
    // If we have a vendor code but no vendor name, try to set it
    if (vendorCode && !vendorName && vendors) {
      const selectedVendor = vendors.find(v => v.vendor_code === vendorCode);
      if (selectedVendor) {
        setValue('vendor_name', selectedVendor.vendor_name);
      }
    }
  }, [vendorCode, vendorName, vendors, setValue]);

  const handleVendorChange = (vendorCode: string) => {
    // Find the vendor in our list
    const selectedVendor = vendors?.find(v => v.vendor_code === vendorCode);
    
    // If we find the vendor, set the vendor_name field too
    if (selectedVendor) {
      setValue('vendor_name', selectedVendor.vendor_name);
    }
    
    return vendorCode;
  };

  if (isLoading) {
    return (
      <FormItem>
        <FormLabel>Vendor</FormLabel>
        <Select disabled>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Loading vendors..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="loading">Loading...</SelectItem>
          </SelectContent>
        </Select>
      </FormItem>
    );
  }

  return (
    <FormField
      control={control}
      name="vendor_code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vendor</FormLabel>
          <Select 
            onValueChange={(value) => {
              handleVendorChange(value);
              field.onChange(value);
            }} 
            value={field.value || ''}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {vendors?.map((vendor) => (
                <SelectItem key={vendor.vendor_code} value={vendor.vendor_code}>
                  {vendor.vendor_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
