
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Building, X } from 'lucide-react';
import { useCustomersData } from '@/hooks/useCustomersData';
import { useDebounce } from '@/hooks/useDebounce';

interface SimplifiedCustomerSearchProps {
  customerCode: string;
  customerName: string;
  onSelectCustomer: (code: string, name: string) => void;
  onClearCustomer: () => void;
  disabled?: boolean;
}

const SimplifiedCustomerSearch = ({
  customerCode,
  customerName,
  onSelectCustomer,
  onClearCustomer,
  disabled = false
}: SimplifiedCustomerSearchProps) => {
  const { customers, isLoading } = useCustomersData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const filteredCustomers = customers.filter(customer => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) return false;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      customer.customer_code.toLowerCase().includes(searchLower) ||
      customer.customer_name.toLowerCase().includes(searchLower) ||
      (customer.search_name && customer.search_name.toLowerCase().includes(searchLower))
    );
  }).slice(0, 10);
  
  // Only show dropdown when user has typed 2+ characters and we have results
  useEffect(() => {
    setShowDropdown(
      debouncedSearchTerm.length >= 2 && 
      filteredCustomers.length > 0 && 
      !customerCode // Don't show when customer is already selected
    );
  }, [debouncedSearchTerm, filteredCustomers.length, customerCode]);
  
  const handleSelectCustomer = (code: string, name: string) => {
    onSelectCustomer(code, name);
    setSearchTerm('');
    setShowDropdown(false);
  };
  
  const handleClearCustomer = () => {
    onClearCustomer();
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };
    
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="customer-search">Customer Search</Label>
      <div className="relative">
        {!customerCode ? (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Input
              id="customer-search"
              placeholder="Search by customer code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={disabled}
              className="pr-10"
              autoComplete="off"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            
            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-hidden">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading customers...</div>
                  ) : filteredCustomers.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No customers found</div>
                  ) : (
                    <div className="p-1">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.customer_code}
                          className="flex items-center space-x-3 p-3 hover:bg-accent cursor-pointer rounded-sm"
                          onClick={() => handleSelectCustomer(customer.customer_code, customer.customer_name)}
                        >
                          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{customer.customer_code}</div>
                            <div className="text-sm text-muted-foreground truncate">{customer.customer_name}</div>
                            {customer.search_name && (
                              <div className="text-xs text-muted-foreground truncate">{customer.search_name}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
            <Building className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{customerCode}</div>
              <div className="text-sm text-muted-foreground truncate">{customerName}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearCustomer}
              disabled={disabled}
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {!customerCode && (
        <p className="text-sm text-muted-foreground">
          Type at least 2 characters to search for customers
        </p>
      )}
    </div>
  );
};

export default SimplifiedCustomerSearch;
