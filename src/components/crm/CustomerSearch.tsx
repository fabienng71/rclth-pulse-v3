
import { useState, useEffect } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Customer, useCustomerSearch } from '@/hooks/useCustomersData';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface CustomerSearchProps {
  onSelectCustomer: (customer: Customer) => void;
  disabled?: boolean;
}

export const CustomerSearch = ({ onSelectCustomer, disabled = false }: CustomerSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { results: searchResults, isLoading: isSearching } = useCustomerSearch(debouncedSearchTerm);
  const [openCustomerSearch, setOpenCustomerSearch] = useState(false);
  
  // Ensure displayResults is always an array, even if searchResults is undefined
  const displayResults = searchResults || [];

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setOpenCustomerSearch(true);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="relative">
      <div className="flex">
        <div className="relative flex-grow">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={() => {
              if (searchTerm.length >= 2) {
                setOpenCustomerSearch(true);
              }
            }}
            className="pr-10"
            autoComplete="off"
            disabled={disabled}
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      {openCustomerSearch && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
          <div className="max-h-[300px] overflow-y-auto p-1">
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <span className="text-sm text-muted-foreground">🔍 Searching customers...</span>
              </div>
            ) : searchTerm.length < 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : displayResults.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No customers found
              </div>
            ) : (
              <Command className="border-none">
                <CommandList>
                  <CommandGroup>
                    {displayResults.map((customer) => (
                      <CommandItem
                        key={customer.customer_code}
                        value={customer.customer_code}
                        onSelect={() => {
                          onSelectCustomer(customer);
                          setOpenCustomerSearch(false);
                          setSearchTerm('');
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{customer.search_name || customer.customer_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {customer.customer_name} ({customer.customer_code})
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
