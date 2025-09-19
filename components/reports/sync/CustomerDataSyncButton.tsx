
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw } from 'lucide-react';
import { syncCustomerData, syncAllCustomers } from '@/services/customerSyncService';

interface CustomerDataSyncButtonProps {
  customerCode?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function CustomerDataSyncButton({ 
  customerCode, 
  variant = 'outline',
  size = 'sm'
}: CustomerDataSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSync = async () => {
    setIsLoading(true);
    try {
      let result;
      
      if (customerCode) {
        // Sync specific customer
        result = await syncCustomerData(customerCode);
      } else {
        // Sync all customers
        result = await syncAllCustomers();
      }
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: result.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sync Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          🔄 Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          {customerCode ? 'Sync Customer Data' : 'Sync All Customers'}
        </>
      )}
    </Button>
  );
}
