
import { supabase } from '@/integrations/supabase/client';

interface SyncLogData {
  sync_type: string;
  status: 'success' | 'partial' | 'failed';
  records_processed?: number;
  records_updated?: number;
  records_inserted?: number;
  errors?: unknown[];
  sync_duration_ms?: number;
}

export const logSyncOperation = async (logData: SyncLogData): Promise<void> => {
  try {
    const { error } = await supabase
      .from('sync_log')
      .insert([{
        sync_type: logData.sync_type,
        status: logData.status,
        records_processed: logData.records_processed || 0,
        records_updated: logData.records_updated || 0,
        records_inserted: logData.records_inserted || 0,
        errors: logData.errors && logData.errors.length > 0 ? logData.errors : null,
        sync_duration_ms: logData.sync_duration_ms,
        synced_by: (await supabase.auth.getUser()).data.user?.id || null,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error logging sync operation:', error);
    } else {
      console.log(`Sync operation logged: ${logData.sync_type} - ${logData.status}`);
    }
  } catch (error) {
    console.error('Failed to log sync operation:', error);
  }
};
