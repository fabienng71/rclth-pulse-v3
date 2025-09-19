
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerForm, CustomerFormData } from './CustomerForm';
import { CustomerWithAnalytics } from '@/hooks/useCustomersWithAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerWithAnalytics | null;
  onCustomerUpdated?: () => void;
}

export const EditCustomerDialog: React.FC<EditCustomerDialogProps> = ({
  open,
  onOpenChange,
  customer,
  onCustomerUpdated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: CustomerFormData) => {
    if (!customer) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('customer_code', customer.customer_code);

      if (error) {
        console.error('Error updating customer:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to update customer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });

      onOpenChange(false);
      if (onCustomerUpdated) {
        onCustomerUpdated();
      }
    } catch (error: any) {
      console.error('Unexpected error updating customer:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) return null;

  const initialData: Partial<CustomerFormData> = {
    customer_code: customer.customer_code,
    customer_name: customer.customer_name,
    search_name: customer.search_name || '',
    customer_type_code: customer.customer_type_code || '',
    salesperson_code: customer.salesperson_code || '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Modify customer information for {customer.customer_name}.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm 
          onSubmit={handleSubmit}
          initialData={initialData}
          isEdit={true}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
