
import { useEffect } from 'react';
import { useCustomersData } from '@/hooks/useCustomersData';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { FormData } from './types';
import { CustomerSearch } from './CustomerSearch';

interface CustomerInfoFormProps {
  control: Control<FormData>;
  onCustomerChange: (customerId: string) => void;
}

export const CustomerInfoForm = ({ control, onCustomerChange }: CustomerInfoFormProps) => {
  const { customers, isLoading: isLoadingCustomers } = useCustomersData();

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="customer_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer</FormLabel>
            <FormControl>
              <CustomerSearch
                onSelectCustomer={(customerCode) => {
                  field.onChange(customerCode);
                  onCustomerChange(customerCode);
                }}
                placeholder="Search and select a customer"
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="customer_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Name (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Customer name" {...field} />
            </FormControl>
            <FormDescription>
              Override or provide a name if not selecting from existing customers
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="customer_address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Address</FormLabel>
            <FormControl>
              <Textarea placeholder="Customer address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
