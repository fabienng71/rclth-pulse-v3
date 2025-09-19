
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Customer } from '@/hooks/useCustomersData';
import { CustomerSearch } from './CustomerSearch';
import { Control, FieldValues } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

interface CustomerFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
}

export const CustomerField = ({ control }: CustomerFieldProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<{ code: string; name: string; search_name?: string | null }  | null>(null);
  const [customerData, setCustomerData] = useState<{ search_name?: string | null; customer_name?: string | null } | null>(null);

  // Fetch customer data when customer_code changes
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (control._formValues.customer_code) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('search_name, customer_name')
            .eq('customer_code', control._formValues.customer_code)
            .single();
            
          if (error) {
            console.error('Error fetching customer data:', error);
            return;
          }
          
          if (data) {
            setCustomerData(data);
          }
        } catch (err) {
          console.error('Error in customer data fetch:', err);
        }
      }
    };

    fetchCustomerData();
  }, [control._formValues.customer_code]);

  const handleSelectCustomer = (customer: Customer) => {
    console.log('Selected customer:', customer);
    setSelectedCustomer({
      code: customer.customer_code,
      name: customer.customer_name,
      search_name: customer.search_name
    });
    
    // Set the form values
    control._formValues.customer_code = customer.customer_code;
    control._formValues.customer_name = customer.customer_name;
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerData(null);
    
    // Clear the form values
    control._formValues.customer_code = '';
    control._formValues.customer_name = '';
    
    // Trigger form updates with correct format
    control._subjects.values.next({ values: control._formValues });
  };

  // Determine display name - prioritize fetched data over local state
  const displayName = customerData?.search_name || customerData?.customer_name || 
                       selectedCustomer?.search_name || selectedCustomer?.name || 
                       control._formValues.customer_name;

  return (
    <FormField
      control={control}
      name="customer_code"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Customer</FormLabel>
          <CustomerSearch 
            onSelectCustomer={(customer) => {
              field.onChange(customer.customer_code);
              handleSelectCustomer(customer);
            }} 
          />
          {field.value && (
            <div className="text-sm text-muted-foreground mt-1 bg-blue-50 p-2 rounded-md flex items-center justify-between">
              <span>Selected: {displayName} ({field.value})</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearCustomer}
                className="h-6 w-6 p-0 hover:bg-red-100"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
          <FormMessage />
          
          {/* Hidden input for customer_name */}
          <FormField
            control={control}
            name="customer_name"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </FormItem>
      )}
    />
  );
};
