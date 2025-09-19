
import { useEffect, useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/hooks/useVendorsData';

interface VendorFilterProps {
  selectedVendor: string | null;
  onVendorChange: (vendor: string | null) => void;
}

const VendorFilter = ({ selectedVendor, onVendorChange }: VendorFilterProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('vendor_code, vendor_name')
          .order('vendor_name');
        
        if (error) {
          setError(new Error(`Error fetching vendors: ${error.message}`));
          console.error('Error fetching vendors:', error);
        } else if (data) {
          // Filter out any vendors with empty codes
          const validVendors = data.filter(v => v.vendor_code && v.vendor_code.trim() !== '');
          setVendors(validVendors);
        }
      } catch (error) {
        setError(new Error(`Unexpected error fetching vendors`));
        console.error('Unexpected error fetching vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const handleVendorChange = (value: string) => {
    onVendorChange(value === 'all' ? null : value);
  };

  return (
    <div className="space-y-2 h-full flex flex-col justify-end">
      <Label htmlFor="vendor-filter">Filter by Vendor</Label>
      <Select
        disabled={isLoading}
        value={selectedVendor || 'all'}
        onValueChange={handleVendorChange}
      >
        <SelectTrigger id="vendor-filter" className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : "Select a vendor"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vendors</SelectItem>
          {isLoading && <SelectItem value="loading">Loading vendors...</SelectItem>}
          {error && <SelectItem value="error">Error loading vendors</SelectItem>}
          {!isLoading && !error && vendors.length === 0 && (
            <SelectItem value="no-vendors">No vendors available</SelectItem>
          )}
          {vendors.map(vendor => {
            // Ensure vendor_code is never empty
            const code = vendor.vendor_code || `vendor-${Math.random().toString(36).substring(7)}`;
            const name = vendor.vendor_name || "Unnamed Vendor";
            
            return (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VendorFilter;
