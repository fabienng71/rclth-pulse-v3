import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ItemsStockSyncService, SyncResult } from '@/services/itemsStockSyncService';

/**
 * Hook for managing items to stock_onhands synchronization
 */
export const useItemsStockSync = () => {
  const [isManualSyncRunning, setIsManualSyncRunning] = useState(false);
  const queryClient = useQueryClient();

  // Query for last sync information
  const { data: lastSyncInfo, refetch: refetchLastSync } = useQuery({
    queryKey: ['itemsStockSync', 'lastSync'],
    queryFn: () => ItemsStockSyncService.getLastSyncInfo(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider stale after 10 seconds
  });

  // Query for sync statistics
  const { data: syncStats, refetch: refetchStats } = useQuery({
    queryKey: ['itemsStockSync', 'statistics'],
    queryFn: () => ItemsStockSyncService.getSyncStatistics(7),
    staleTime: 60000, // Consider stale after 1 minute
  });

  // Query to check if sync is currently running
  const { data: isSyncRunning, refetch: refetchSyncStatus } = useQuery({
    queryKey: ['itemsStockSync', 'isRunning'],
    queryFn: () => ItemsStockSyncService.isSyncRunning(),
    refetchInterval: isManualSyncRunning ? 2000 : 30000, // More frequent when sync is running
    staleTime: 5000,
  });

  // Mutation for manual sync
  const manualSyncMutation = useMutation({
    mutationFn: () => ItemsStockSyncService.manualSyncAllItems(),
    onMutate: () => {
      setIsManualSyncRunning(true);
      toast.loading('Starting manual sync...', { id: 'manual-sync' });
    },
    onSuccess: (result: SyncResult) => {
      setIsManualSyncRunning(false);
      
      if (result.success) {
        toast.success(
          `Sync completed successfully! Updated ${result.updated_records} records, inserted ${result.inserted_records} records.`,
          { 
            id: 'manual-sync',
            duration: 5000,
            description: `Processed ${result.total_items} items in ${result.duration_seconds.toFixed(1)} seconds`
          }
        );
      } else {
        toast.error(
          `Sync completed with ${result.error_count} errors. Updated ${result.updated_records} records.`,
          { 
            id: 'manual-sync',
            duration: 8000,
            description: result.errors.length > 0 ? result.errors[0] : 'Check sync logs for details'
          }
        );
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['itemsStockSync'] });
      queryClient.invalidateQueries({ queryKey: ['itemsData'] });
      queryClient.invalidateQueries({ queryKey: ['stockData'] });
    },
    onError: (error: Error) => {
      setIsManualSyncRunning(false);
      toast.error(`Sync failed: ${error.message}`, { 
        id: 'manual-sync',
        duration: 8000 
      });
    },
  });

  // Mutation for refreshing stock summary view
  const refreshViewMutation = useMutation({
    mutationFn: () => ItemsStockSyncService.refreshStockSummaryView(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Stock summary view refreshed successfully');
        queryClient.invalidateQueries({ queryKey: ['stockData'] });
      } else {
        toast.error(`Failed to refresh view: ${result.message}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh view: ${error.message}`);
    },
  });

  // Function to trigger manual sync
  const triggerManualSync = useCallback(async () => {
    if (isManualSyncRunning || isSyncRunning) {
      toast.warning('Sync is already running. Please wait for it to complete.');
      return;
    }
    
    manualSyncMutation.mutate();
  }, [isManualSyncRunning, isSyncRunning, manualSyncMutation]);

  // Function to refresh the stock summary view
  const refreshStockSummaryView = useCallback(() => {
    refreshViewMutation.mutate();
  }, [refreshViewMutation]);

  // Function to validate sync system
  const validateSyncSystem = useCallback(async () => {
    try {
      const validation = await ItemsStockSyncService.validateSyncSystem();
      
      if (validation.isValid) {
        toast.success('Sync system is properly configured');
      } else {
        toast.error('Sync system has configuration issues', {
          description: validation.issues.join('; '),
          duration: 8000
        });
      }
      
      if (validation.recommendations.length > 0) {
        toast.info('Recommendations', {
          description: validation.recommendations.join('; '),
          duration: 6000
        });
      }
      
      return validation;
    } catch (error) {
      toast.error('Failed to validate sync system');
      throw error;
    }
  }, []);

  // Function to refresh all sync-related data
  const refreshSyncData = useCallback(() => {
    refetchLastSync();
    refetchStats();
    refetchSyncStatus();
  }, [refetchLastSync, refetchStats, refetchSyncStatus]);

  return {
    // Data
    lastSyncInfo,
    syncStats,
    isSyncRunning: isManualSyncRunning || isSyncRunning,
    
    // Actions
    triggerManualSync,
    refreshStockSummaryView,
    validateSyncSystem,
    refreshSyncData,
    
    // Loading states
    isManualSyncRunning,
    isRefreshingView: refreshViewMutation.isPending,
    
    // Mutations for direct access if needed
    manualSyncMutation,
    refreshViewMutation,
  };
};