import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  cogsManagementService,
  SyncValidationResult,
  SyncStats,
  RefreshResult,
  ImportResult
} from '@/services/cogsManagementService';

// ============================================================================
// COGS Synchronization Hooks
// ============================================================================
// React hooks for managing COGS synchronization and monitoring
// ============================================================================

export const useCogsSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get sync validation results
  const { 
    data: syncIssues = [], 
    isLoading: isValidating, 
    error: validationError,
    refetch: refreshValidation 
  } = useQuery({
    queryKey: ['cogs-sync-validation'],
    queryFn: () => cogsManagementService.validateSync(),
    refetchInterval: 60000, // Check every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Query to get sync statistics
  const { 
    data: syncStats, 
    isLoading: isLoadingStats, 
    error: statsError,
    refetch: refreshStats 
  } = useQuery({
    queryKey: ['cogs-sync-stats'],
    queryFn: () => cogsManagementService.getSyncStats(),
    refetchInterval: 120000, // Check every 2 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });

  // Mutation to refresh COGS master table
  const refreshMasterMutation = useMutation({
    mutationFn: () => cogsManagementService.refreshCogsMaster(),
    onSuccess: (result: RefreshResult) => {
      if (result.success) {
        toast({
          title: "Success",
          description: `COGS master refreshed successfully. Processed ${result.processed_count} items in ${result.execution_time_seconds?.toFixed(2)}s`,
        });
        
        // Invalidate all COGS-related queries
        queryClient.invalidateQueries({ queryKey: ['cogs-sync-validation'] });
        queryClient.invalidateQueries({ queryKey: ['cogs-sync-stats'] });
        queryClient.invalidateQueries({ queryKey: ['cogsData'] });
        queryClient.invalidateQueries({ queryKey: ['cogsHistory'] });
      } else {
        toast({
          title: "Error",
          description: `Refresh failed: ${result.error_message}`,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to refresh COGS master: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to import COGS data
  const importDataMutation = useMutation({
    mutationFn: (file: File) => cogsManagementService.importCogsData(file),
    onSuccess: (result: ImportResult) => {
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Imported ${result.recordsInserted} records successfully`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `Imported ${result.recordsInserted} records. ${result.errors.length} errors occurred.`,
          variant: "destructive",
        });
      }
      
      // Invalidate all COGS-related queries
      queryClient.invalidateQueries({ queryKey: ['cogs-sync-validation'] });
      queryClient.invalidateQueries({ queryKey: ['cogs-sync-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cogsData'] });
      queryClient.invalidateQueries({ queryKey: ['cogsHistory'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: `Failed to import COGS data: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Helper function to download template
  const downloadTemplate = async () => {
    try {
      const blob = await cogsManagementService.downloadTemplate();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cogs_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Template Downloaded",
        description: "COGS import template has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download template: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return {
    // Sync validation data
    syncIssues,
    hasIssues: syncIssues.length > 0,
    isValidating,
    validationError,
    refreshValidation,
    
    // Sync statistics
    syncStats,
    isLoadingStats,
    statsError,
    refreshStats,
    
    // Actions
    refreshMaster: refreshMasterMutation.mutate,
    isRefreshing: refreshMasterMutation.isPending,
    
    importData: importDataMutation.mutate,
    isImporting: importDataMutation.isPending,
    
    downloadTemplate,
    
    // Overall status
    isLoading: isValidating || isLoadingStats,
    hasErrors: !!validationError || !!statsError,
  };
};

// Hook for monitoring COGS sync health
export const useCogsSyncHealth = () => {
  const { syncStats, syncIssues, isLoading } = useCogsSync();
  
  const healthStatus = {
    status: 'unknown' as 'healthy' | 'warning' | 'critical' | 'unknown',
    message: 'Checking sync status...',
    syncPercentage: 0,
    lastSyncAge: null as number | null,
  };

  if (!isLoading && syncStats) {
    const syncPercentage = syncStats.sync_percentage;
    const issueCount = syncIssues.length;
    
    healthStatus.syncPercentage = syncPercentage;
    
    // Calculate last sync age in hours
    if (syncStats.last_sync_date) {
      const lastSync = new Date(syncStats.last_sync_date);
      const now = new Date();
      healthStatus.lastSyncAge = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    }
    
    // Determine health status
    if (syncPercentage >= 95 && issueCount === 0) {
      healthStatus.status = 'healthy';
      healthStatus.message = 'All COGS data is synchronized';
    } else if (syncPercentage >= 85 && issueCount < 10) {
      healthStatus.status = 'warning';
      healthStatus.message = `${issueCount} sync issues found (${syncPercentage}% synchronized)`;
    } else {
      healthStatus.status = 'critical';
      healthStatus.message = `${issueCount} sync issues found (${syncPercentage}% synchronized)`;
    }
    
    // Add age warning
    if (healthStatus.lastSyncAge && healthStatus.lastSyncAge > 24) {
      healthStatus.status = healthStatus.status === 'healthy' ? 'warning' : healthStatus.status;
      healthStatus.message += `. Last sync was ${Math.round(healthStatus.lastSyncAge)} hours ago`;
    }
  }
  
  return {
    ...healthStatus,
    isLoading,
    syncStats,
    syncIssues,
  };
};