
import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useCustomersData } from '@/hooks/useCustomersData';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/useDebounce';

interface CustomerSearchProps {
  onSelectCustomer: (customerCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
}

export const CustomerSearch = ({ 
  onSelectCustomer, 
  disabled = false, 
  placeholder = "Search customers...", 
  value 
}: CustomerSearchProps) => {
  const { customers, isLoading } = useCustomersData();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search query to prevent rapid updates
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Only open dropdown when user types something and after debounce
  useEffect(() => {
    if (debouncedSearchQuery.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [debouncedSearchQuery]);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => {
    const query = debouncedSearchQuery.toLowerCase();
    return (
      (customer.customer_code && customer.customer_code.toLowerCase().includes(query)) ||
      (customer.customer_name && customer.customer_name.toLowerCase().includes(query)) ||
      (customer.search_name && customer.search_name.toLowerCase().includes(query))
    );
  }).slice(0, 10); // Limit to 10 results for performance

  const handleSelect = (customerCode: string) => {
    onSelectCustomer(customerCode);
    setOpen(false);
    setSearchQuery('');
  };
  
  // Handle the input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Close dropdown when clicking outside
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen || searchQuery.length === 0) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            disabled={disabled}
            className="w-full pr-10"
            autoComplete="off"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[1000px] p-0 bg-background border" align="start" sideOffset={5}>
        <Command>
          <CommandList>
            <CommandEmpty>No customers found.</CommandEmpty>
            <CommandGroup>
              {filteredCustomers.map((customer) => (
                <CommandItem
                  key={customer.customer_code}
                  value={customer.customer_code}
                  onSelect={() => handleSelect(customer.customer_code)}
                  className="flex flex-col items-start"
                >
                  <div className="font-medium">{customer.customer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.customer_code} {customer.search_name ? `(${customer.search_name})` : ""}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
