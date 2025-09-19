
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useVendorsData } from '@/hooks/useVendorsData';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VendorSearchProps {
  onSelect: (vendor: { vendor_code: string, vendor_name: string }) => void;
  selectedVendorCode?: string;
}

const VendorSearch: React.FC<VendorSearchProps> = ({ onSelect, selectedVendorCode }) => {
  const { vendors, isLoading } = useVendorsData();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);
  
  // Find the selected vendor from the vendors list
  const selectedVendor = vendors.find(v => v.vendor_code === selectedVendorCode);
  
  // Filter vendors based on search value
  const filteredVendors = vendors.filter(
    vendor => 
      vendor.vendor_code.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
      vendor.vendor_name.toLowerCase().includes(debouncedSearchValue.toLowerCase())
  );
  
  const handleSelect = (vendorCode: string) => {
    const vendor = vendors.find(v => v.vendor_code === vendorCode);
    if (vendor) {
      onSelect(vendor);
      setOpen(false);
      setSearchValue(''); // Clear search after selection
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedVendor ? 
            `${selectedVendor.vendor_name} (${selectedVendor.vendor_code})` : 
            "Select vendor..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search vendors..."
              className="h-9 w-full border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading vendors...
                </div>
              ) : (
                "No vendors found"
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredVendors.map((vendor) => (
                <CommandItem
                  key={vendor.vendor_code}
                  value={vendor.vendor_code}
                  onSelect={() => handleSelect(vendor.vendor_code)}
                >
                  <div className="flex-1 truncate">
                    {vendor.vendor_name} 
                    <span className="ml-2 text-muted-foreground text-sm">
                      ({vendor.vendor_code})
                    </span>
                  </div>
                  {selectedVendorCode === vendor.vendor_code && (
                    <Check className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default VendorSearch;
