
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerForm, CustomerFormData } from './CustomerForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated?: () => void;
}

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  open,
  onOpenChange,
  onCustomerCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      // Ensure we have the required fields with proper types
      const customerData = {
        customer_code: data.customer_code,
        customer_name: data.customer_name,
        search_name: data.search_name || null,
        customer_type_code: data.customer_type_code || null,
        salesperson_code: data.salesperson_code || null,
      };

      const { error } = await supabase
        .from('customers')
        .insert(customerData);

      if (error) {
        console.error('Error creating customer:', error);
        
        // Handle specific error cases
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: `Customer code "${data.customer_code}" already exists. Please use a different code.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "Failed to create customer",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Customer created successfully",
      });

      onOpenChange(false);
      if (onCustomerCreated) {
        onCustomerCreated();
      }
    } catch (error: any) {
      console.error('Unexpected error creating customer:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer record in the system.
          </DialogDescription>
        </DialogHeader>
        <CustomerForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
