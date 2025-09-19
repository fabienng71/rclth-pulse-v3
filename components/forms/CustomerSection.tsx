
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomerSearch } from '@/components/quotations/CustomerSearch';
import { Customer } from '@/hooks/useCustomersData';
import { Control } from 'react-hook-form';
import { ReturnFormValues } from '@/hooks/returnFormSchema';

interface CustomerSectionProps {
  control: Control<ReturnFormValues>;
  selectedCustomer: Customer | null;
  handleCustomerSelect: (customerCode: string) => void;
}

const CustomerSection = ({ control, selectedCustomer, handleCustomerSelect }: CustomerSectionProps) => {
  return (
    <FormField
      control={control}
      name="customerCode"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Customer</FormLabel>
          <CustomerSearch 
            onSelectCustomer={handleCustomerSelect}
            placeholder="Search for a customer..."
          />
          {selectedCustomer && (
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="font-medium">{selectedCustomer.customer_name}</p>
              <p className="text-sm text-muted-foreground">Code: {selectedCustomer.customer_code}</p>
              {selectedCustomer.customer_type_code && (
                <p className="text-sm text-muted-foreground">Type: {selectedCustomer.customer_type_code}</p>
              )}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomerSection;
