
import React, { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Search, X, Loader2 } from 'lucide-react';
import { useCustomersData } from '@/hooks/useCustomersData';
import { useDebounce } from '@/hooks/useDebounce';

interface CustomerSearchSectionProps {
  customerCode: string;
  customerName: string;
  isSubmitting: boolean;
  onSelectCustomer: (code: string, name: string) => void;
  onClearCustomer: () => void;
}

const CustomerSearchSection: React.FC<CustomerSearchSectionProps> = ({
  customerCode,
  customerName,
  isSubmitting,
  onSelectCustomer,
  onClearCustomer
}) => {
  const { customers, isLoading: isLoadingCustomers } = useCustomersData();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms debounce
  
  // Debug logging
  console.log('CustomerSearchSection - Current values:', { customerCode, customerName });
  
  // Automatically open dropdown when debounced search has content
  useEffect(() => {
    if (debouncedSearchQuery.length > 0) {
      setOpen(true);
    }
  }, [debouncedSearchQuery]);
  
  const filteredCustomers = customers.filter(customer => {
    const query = debouncedSearchQuery.toLowerCase();
    
    // Check all relevant fields: customer_name, search_name (if exists), and customer_code
    return (
      customer.customer_name.toLowerCase().includes(query) ||
      (customer.search_name && customer.search_name.toLowerCase().includes(query)) ||
      customer.customer_code.toLowerCase().includes(query)
    );
  });
  
  const selectCustomer = (code: string, name: string) => {
    console.log('CustomerSearchSection - Selecting customer:', { code, name });
    onSelectCustomer(code, name);
    setOpen(false);
    setSearchQuery('');
  };
  
  return (
    <div className="md:col-span-2">
      <Label htmlFor="customerSearch">Customer</Label>
      <div className="relative mt-1">
        <div className="flex">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full">
                <Input
                  id="customerSearch"
                  placeholder="Search for a customer..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Dropdown will open via useEffect when debounced value changes
                  }}
                  onClick={() => {
                    // Don't open dropdown on first click, let user type first
                    // The dropdown will only open after typing via the useEffect
                  }}
                  disabled={isSubmitting}
                  className={customerCode ? "pr-10" : ""}
                  // Add autoComplete="off" to prevent browser autocomplete
                  autoComplete="off"
                />
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[400px]" align="start" sideOffset={5} onInteractOutside={(e) => {
              // Allow clicking outside to close without losing focus
              e.preventDefault();
            }}>
              <Command>
                <CommandList>
                  <CommandEmpty>
                    {isLoadingCustomers ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading customers...
                      </div>
                    ) : (
                      "No customers found"
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredCustomers.slice(0, 10).map((customer) => (
                      <CommandItem
                        key={customer.customer_code}
                        onSelect={() => selectCustomer(customer.customer_code, customer.customer_name)}
                        className="flex flex-col items-start"
                        onMouseDown={(e) => {
                          // Prevent blur event when clicking on items
                          e.preventDefault();
                        }}
                      >
                        <div className="flex items-center w-full">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{customer.customer_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.search_name ? `${customer.search_name} • ` : ''}{customer.customer_code}
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {customerCode && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                console.log('Clearing customer selection');
                onClearCustomer();
                setSearchQuery('');
              }}
              className="ml-1"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {customerCode ? (
        <p className="text-sm text-muted-foreground mt-1">
          Selected customer: {customerName} ({customerCode})
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mt-1">
          Please select a customer for this sample request
        </p>
      )}
    </div>
  );
};

export default CustomerSearchSection;
