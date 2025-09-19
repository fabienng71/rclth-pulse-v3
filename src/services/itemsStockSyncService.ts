import { supabase } from '@/integrations/supabase/client';
import { logSyncOperation } from '@/utils/syncLogging';

export interface SyncResult {
  success: boolean;
  total_items: number;
  updated_records: number;
  inserted_records: number;
  error_count: number;
  errors: string[];
  duration_seconds: number;
  started_at: string;
  completed_at: string;
}

export interface SyncProgress {
  isRunning: boolean;
  progress: number;
  currentOperation: string;
  estimatedTimeRemaining?: number;
}

/**
 * Service for managing synchronization between items and stock_onhands tables
 */
export class ItemsStockSyncService {
  /**
   * Trigger manual synchronization of all items to stock_onhands table
   */
  static async manualSyncAllItems(): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      // Call the database function for manual sync
      const { data, error } = await supabase.rpc('manual_sync_all_items_to_stock');
      
      if (error) {
        throw new Error(`Database sync function failed: ${error.message}`);
      }
      
      // Parse the JSON result from the database function
      const result: SyncResult = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Log the sync operation using existing logging utility
      const duration = Date.now() - startTime;
      await logSyncOperation({
        sync_type: 'manual_items_stock_sync_frontend',
        status: result.success ? 'success' : (result.error_count > 0 ? 'partial' : 'failed'),
        records_processed: result.total_items,
        records_inserted: result.inserted_records,
        records_updated: result.updated_records,
        errors: result.errors.length > 0 ? result.errors : undefined,
        sync_duration_ms: duration
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log the failed operation
      await logSyncOperation({
        sync_type: 'manual_items_stock_sync_frontend',
        status: 'failed',
        records_processed: 0,
        records_inserted: 0,
        records_updated: 0,
        errors: [errorMessage],
        sync_duration_ms: duration
      });
      
      // Return a failed result
      return {
        success: false,
        total_items: 0,
        updated_records: 0,
        inserted_records: 0,
        error_count: 1,
        errors: [errorMessage],
        duration_seconds: duration / 1000,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    }
  }
  
  /**
   * Check if sync is currently running by looking at recent sync logs
   */
  static async isSyncRunning(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('status, created_at')
        .eq('sync_type', 'manual_items_stock_sync')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.warn('Could not check sync status:', error.message);
        return false;
      }
      
      // If there's a recent sync log without completion status, assume it's running
      return data && data.length > 0 && data[0].status === 'running';
      
    } catch (error) {
      console.warn('Error checking sync status:', error);
      return false;
    }
  }
  
  /**
   * Get the last sync operation details
   */
  static async getLastSyncInfo(): Promise<{
    lastSyncAt?: string;
    status?: string;
    recordsProcessed?: number;
    recordsUpdated?: number;
    recordsInserted?: number;
    errors?: string[];
  } | null> {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .in('sync_type', ['manual_items_stock_sync', 'manual_items_stock_sync_frontend'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error || !data || data.length === 0) {
        return null;
      }
      
      const lastSync = data[0];
      return {
        lastSyncAt: lastSync.created_at,
        status: lastSync.status,
        recordsProcessed: lastSync.records_processed,
        recordsUpdated: lastSync.records_updated,
        recordsInserted: lastSync.records_inserted,
        errors: lastSync.errors
      };
      
    } catch (error) {
      console.warn('Error fetching last sync info:', error);
      return null;
    }
  }
  
  /**
   * Refresh the stock summary materialized view
   */
  static async refreshStockSummaryView(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { error } = await supabase.rpc('refresh_stock_summary');
      
      if (error) {
        throw new Error(`Failed to refresh stock summary view: ${error.message}`);
      }
      
      return {
        success: true,
        message: 'Stock summary view refreshed successfully'
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  
  /**
   * Validate that the sync system is properly set up
   */
  static async validateSyncSystem(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
    }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    try {
      // Check if the required columns exist in stock_onhands
      const { data: stockColumns, error: stockError } = await supabase
        .from('stock_onhands')
        .select('brand, attribut_1, pricelist, synced_at')
        .limit(1);
      
      if (stockError) {
        issues.push('Cannot access stock_onhands table or required columns are missing');
      }
      
      // Check if sync functions exist
      const { error: manualSyncError } = await supabase.rpc('manual_sync_all_items_to_stock');
      if (manualSyncError && !manualSyncError.message.includes('permission denied')) {
        // Only consider it an issue if it's not a permission error (which might be expected)
        if (!manualSyncError.message.includes('function does not exist')) {
          recommendations.push('Manual sync function exists but may have configuration issues');
        } else {
          issues.push('Manual sync function (manual_sync_all_items_to_stock) does not exist');
        }
      }
      
      // Check if sync_logs table exists
      const { error: syncLogsError } = await supabase
        .from('sync_logs')
        .select('id')
        .limit(1);
      
      if (syncLogsError) {
        recommendations.push('Sync logs table is not accessible - sync history will not be available');
      }
      
      // Check recent sync activity
      const lastSyncInfo = await this.getLastSyncInfo();
      if (!lastSyncInfo) {
        recommendations.push('No recent sync activity found - consider running a manual sync to test the system');
      }
      
      return {
        isValid: issues.length === 0,
        issues,
        recommendations
      };
      
    } catch (error) {
      issues.push(`System validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        issues,
        recommendations
      };
    }
  }
  
  /**
   * Get sync statistics for monitoring
   */
  static async getSyncStatistics(days: number = 7): Promise<{
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    averageDuration: number;
    totalRecordsProcessed: number;
    totalRecordsUpdated: number;
  }> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('sync_logs')
        .select('status, sync_duration_ms, records_processed, records_updated')
        .in('sync_type', ['manual_items_stock_sync', 'manual_items_stock_sync_frontend', 'items_stock_sync_trigger'])
        .gte('created_at', sinceDate);
      
      if (error || !data) {
        return {
          totalSyncs: 0,
          successfulSyncs: 0,
          failedSyncs: 0,
          averageDuration: 0,
          totalRecordsProcessed: 0,
          totalRecordsUpdated: 0
        };
      }
      
      const stats = data.reduce((acc, log) => {
        acc.totalSyncs++;
        if (log.status === 'success') {
          acc.successfulSyncs++;
        } else if (log.status === 'failed') {
          acc.failedSyncs++;
        }
        acc.totalDuration += log.sync_duration_ms || 0;
        acc.totalRecordsProcessed += log.records_processed || 0;
        acc.totalRecordsUpdated += log.records_updated || 0;
        return acc;
      }, {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        totalDuration: 0,
        totalRecordsProcessed: 0,
        totalRecordsUpdated: 0
      });
      
      return {
        ...stats,
        averageDuration: stats.totalSyncs > 0 ? stats.totalDuration / stats.totalSyncs : 0
      };
      
    } catch (error) {
      console.warn('Error fetching sync statistics:', error);
      return {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageDuration: 0,
        totalRecordsProcessed: 0,
        totalRecordsUpdated: 0
      };
    }
  }
}

export default ItemsStockSyncService;