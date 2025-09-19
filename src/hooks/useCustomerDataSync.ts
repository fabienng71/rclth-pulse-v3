
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  isInSync: boolean;
  missingCustomers: string[];
  lastChecked: Date;
}

export const useCustomerDataSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const { toast } = useToast();

  const checkSyncStatus = async () => {
    try {
      console.log('Checking customer sync status...');
      
      // Since we now have an automatic trigger, we'll just verify it's working
      // Get unique customers from salesdata
      const { data: salesdataCustomers, error: salesError } = await supabase
        .from('salesdata')
        .select('customer_code')
        .not('customer_code', 'is', null);

      if (salesError) {
        console.error('Error checking salesdata customers:', salesError);
        return;
      }

      // Get customers from customers table
      const { data: customersTableData, error: customersError } = await supabase
        .from('customers')
        .select('customer_code');

      if (customersError) {
        console.error('Error checking customers table:', customersError);
        return;
      }

      const salesdataCodes = new Set(salesdataCustomers?.map(c => c.customer_code) || []);
      const customerTableCodes = new Set(customersTableData?.map(c => c.customer_code) || []);
      
      const missingCustomers = Array.from(salesdataCodes).filter(code => 
        code && !customerTableCodes.has(code)
      );

      const status: SyncStatus = {
        isInSync: missingCustomers.length === 0,
        missingCustomers,
        lastChecked: new Date()
      };

      setSyncStatus(status);
      console.log('Sync status:', status);
      
      if (missingCustomers.length > 0) {
        console.log(`Found ${missingCustomers.length} customers missing from customers table`);
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  const autoSyncCustomers = async () => {
    if (isAutoSyncing) return;
    
    setIsAutoSyncing(true);
    try {
      console.log('Auto-syncing missing customers...');
      
      // The trigger should handle this automatically, but we can manually sync if needed
      const { error } = await supabase.rpc('sync_missing_customers');
      
      if (error) {
        console.error('Error auto-syncing customers:', error);
        toast({
          title: "Sync Warning",
          description: "Some customers may not be synced. The automatic trigger will handle this.",
          variant: "default",
        });
      } else {
        console.log('Customers synced successfully');
        toast({
          title: "Sync Complete",
          description: "Customer data has been synchronized",
        });
      }
      
      // Recheck status
      await checkSyncStatus();
    } catch (error) {
      console.error('Error in auto-sync:', error);
    } finally {
      setIsAutoSyncing(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  return {
    syncStatus,
    checkSyncStatus,
    autoSyncCustomers,
    isAutoSyncing
  };
};
