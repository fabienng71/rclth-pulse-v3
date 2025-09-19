
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncResult {
  success: boolean;
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_updated: number;
  records_inserted: number;
  errors: any[];
  sync_duration_ms: number;
}

export const useStockSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const syncFromGoogleSheets = async (sheetId: string, range?: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-stock-sheets', {
        body: { sheetId, range }
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = data as SyncResult;
      setLastSyncResult(result);

      // Show appropriate toast based on result
      if (result.status === 'success') {
        toast.success(
          `Sync completed successfully! Updated ${result.records_updated} records, inserted ${result.records_inserted} new records.`,
          { duration: 5000 }
        );
      } else if (result.status === 'partial') {
        toast.warning(
          `Sync completed with warnings. Updated ${result.records_updated} records, inserted ${result.records_inserted} new records. ${result.errors.length} errors occurred.`,
          { duration: 7000 }
        );
      } else {
        toast.error(
          `Sync failed. ${result.errors.length} errors occurred during processing.`,
          { duration: 7000 }
        );
      }

      return result;
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(`Sync failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncFromGoogleSheets,
    isLoading,
    lastSyncResult
  };
};
