
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerWithAnalytics } from '@/hooks/useCustomersWithAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerWithAnalytics | null;
  onCustomerDeleted?: () => void;
}

export const DeleteCustomerDialog: React.FC<DeleteCustomerDialogProps> = ({
  open,
  onOpenChange,
  customer,
  onCustomerDeleted
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!customer) return;

    setIsLoading(true);
    try {
      // First check if customer has any sales transactions
      const { data: salesData, error: salesError } = await supabase
        .from('consolidated_sales')
        .select('id')
        .eq('customer_code', customer.customer_code)
        .limit(1);

      if (salesError) {
        console.error('Error checking sales data:', salesError);
        toast({
          title: "Error",
          description: "Failed to verify customer data before deletion",
          variant: "destructive",
        });
        return;
      }

      if (salesData && salesData.length > 0) {
        toast({
          title: "Cannot Delete Customer",
          description: "This customer has existing sales transactions and cannot be deleted. Consider archiving instead.",
          variant: "destructive",
        });
        return;
      }

      // Check for sample requests
      const { data: sampleData, error: sampleError } = await supabase
        .from('sample_requests')
        .select('id')
        .eq('customer_code', customer.customer_code)
        .limit(1);

      if (sampleError) {
        console.error('Error checking sample requests:', sampleError);
        toast({
          title: "Error",
          description: "Failed to verify customer data before deletion",
          variant: "destructive",
        });
        return;
      }

      if (sampleData && sampleData.length > 0) {
        toast({
          title: "Cannot Delete Customer",
          description: "This customer has existing sample requests and cannot be deleted.",
          variant: "destructive",
        });
        return;
      }

      // Check for activities
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('id')
        .eq('customer_code', customer.customer_code)
        .limit(1);

      if (activityError) {
        console.error('Error checking activities:', activityError);
        toast({
          title: "Error",
          description: "Failed to verify customer data before deletion",
          variant: "destructive",
        });
        return;
      }

      if (activityData && activityData.length > 0) {
        toast({
          title: "Cannot Delete Customer",
          description: "This customer has existing activities and cannot be deleted.",
          variant: "destructive",
        });
        return;
      }

      // Proceed with deletion if no related records exist
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('customer_code', customer.customer_code);

      if (error) {
        console.error('Error deleting customer:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete customer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });

      onOpenChange(false);
      if (onCustomerDeleted) {
        onCustomerDeleted();
      }
    } catch (error: any) {
      console.error('Unexpected error deleting customer:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Customer
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{customer.customer_name}</strong>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div><strong>Customer Code:</strong> {customer.customer_code}</div>
            <div><strong>Customer Name:</strong> {customer.customer_name}</div>
            {customer.search_name && (
              <div><strong>Search Name:</strong> {customer.search_name}</div>
            )}
            <div><strong>Total Turnover:</strong> ${customer.total_turnover.toLocaleString()}</div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This action cannot be undone. The customer will be permanently deleted 
              if they have no existing transactions, sample requests, or activities.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
