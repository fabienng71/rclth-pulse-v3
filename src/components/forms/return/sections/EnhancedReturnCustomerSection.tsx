
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, Building, X } from 'lucide-react';
import { useCustomersData } from '@/hooks/useCustomersData';
import { useDebounce } from '@/hooks/useDebounce';

interface EnhancedReturnCustomerSectionProps {
  customerCode: string;
  customerName: string;
  onSelectCustomer: (code: string, name: string) => void;
  onClearCustomer: () => void;
}

const EnhancedReturnCustomerSection = ({
  customerCode,
  customerName,
  onSelectCustomer,
  onClearCustomer
}: EnhancedReturnCustomerSectionProps) => {
  const { customers, isLoading } = useCustomersData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const filteredCustomers = customers.filter(customer => {
    if (!debouncedSearchTerm) return false;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      customer.customer_code.toLowerCase().includes(searchLower) ||
      customer.customer_name.toLowerCase().includes(searchLower) ||
      (customer.search_name && customer.search_name.toLowerCase().includes(searchLower))
    );
  }).slice(0, 10);
  
  useEffect(() => {
    setShowDropdown(debouncedSearchTerm.length >= 2 && filteredCustomers.length > 0);
  }, [debouncedSearchTerm, filteredCustomers.length]);
  
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
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          Customer Information
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Search and select the customer for this return request
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-search">Customer Search</Label>
          <div className="relative">
            <Input
              id="customer-search"
              placeholder="Search by customer code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (debouncedSearchTerm.length >= 2) {
                  setShowDropdown(true);
                }
              }}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            
            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-hidden">
                <ScrollArea className="h-full">
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading...</div>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
        
        {customerCode && customerName && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-primary">{customerCode}</div>
                    <div className="text-sm text-muted-foreground">{customerName}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCustomer}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {!customerCode && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Required:</strong> Please select a customer to continue
        </div>
      )}
    </div>
  );
};

export default EnhancedReturnCustomerSection;
