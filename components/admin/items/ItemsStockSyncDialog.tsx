import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Loader2, 
  RefreshCw, 
  Database,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useItemsStockSync } from '@/hooks/useItemsStockSync';
import { Badge } from '@/components/ui/badge';

interface ItemsStockSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ItemsStockSyncDialog: React.FC<ItemsStockSyncDialogProps> = ({
  open,
  onOpenChange
}) => {
  const {
    lastSyncInfo,
    syncStats,
    isSyncRunning,
    isManualSyncRunning,
    isRefreshingView,
    triggerManualSync,
    refreshStockSummaryView,
    validateSyncSystem,
    refreshSyncData
  } = useItemsStockSync();

  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } | null>(null);

  // Auto-refresh data when dialog opens
  useEffect(() => {
    if (open) {
      refreshSyncData();
    }
  }, [open, refreshSyncData]);

  const handleValidateSystem = async () => {
    try {
      const result = await validateSyncSystem();
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'partial': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Items to Stock Synchronization
          </DialogTitle>
          <DialogDescription>
            Manage synchronization between items and stock_onhands tables
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Sync Status
              </h3>
              {lastSyncInfo ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(lastSyncInfo.status || 'unknown')}
                    <span className={`font-medium ${getStatusColor(lastSyncInfo.status || 'unknown')}`}>
                      {lastSyncInfo.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(lastSyncInfo.lastSyncAt || '')}
                  </p>
                  {lastSyncInfo.recordsProcessed && (
                    <p className="text-sm">
                      Processed: {lastSyncInfo.recordsProcessed} | 
                      Updated: {lastSyncInfo.recordsUpdated || 0} | 
                      Inserted: {lastSyncInfo.recordsInserted || 0}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sync history found</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Statistics (Last 7 Days)
              </h3>
              {syncStats ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Total: {syncStats.totalSyncs}
                    </Badge>
                    <Badge variant="outline" className="text-green-600">
                      Success: {syncStats.successfulSyncs}
                    </Badge>
                    {syncStats.failedSyncs > 0 && (
                      <Badge variant="outline" className="text-red-600">
                        Failed: {syncStats.failedSyncs}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg Duration: {formatDuration(syncStats.averageDuration)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Records Updated: {syncStats.totalRecordsUpdated.toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Loading statistics...</p>
              )}
            </div>
          </div>

          {/* Current Sync Activity */}
          {isSyncRunning && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Synchronization in progress...</p>
                  <Progress value={undefined} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    This may take several minutes for large datasets. Please don't close this dialog.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Messages */}
          {lastSyncInfo?.errors && lastSyncInfo.errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <p className="font-medium text-red-800 mb-2">Recent Sync Errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {lastSyncInfo.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {lastSyncInfo.errors.length > 3 && (
                    <li className="text-xs">... and {lastSyncInfo.errors.length - 3} more</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Results */}
          {validationResult && (
            <Alert className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-yellow-800'}`}>
                    System Validation: {validationResult.isValid ? 'PASSED' : 'ISSUES FOUND'}
                  </p>
                  {validationResult.issues.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-700">Issues:</p>
                      <ul className="text-sm text-red-600 ml-4">
                        {validationResult.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {validationResult.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-blue-700">Recommendations:</p>
                      <ul className="text-sm text-blue-600 ml-4">
                        {validationResult.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">About Items-Stock Synchronization</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Real-time sync:</strong> Updates to brand, attribut_1, and pricelist fields are automatically synchronized</li>
                  <li>• <strong>Manual sync:</strong> Synchronizes all items data to stock_onhands table</li>
                  <li>• <strong>Performance:</strong> Manual sync processes items in batches for optimal performance</li>
                  <li>• <strong>Logging:</strong> All sync operations are logged for monitoring and troubleshooting</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={triggerManualSync}
              disabled={isSyncRunning}
              className="flex-1"
            >
              {isManualSyncRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Manual Full Sync
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={refreshStockSummaryView}
              disabled={isRefreshingView}
              className="flex-1"
            >
              {isRefreshingView ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Refresh View
                </>
              )}
            </Button>

            <Button 
              variant="outline"
              onClick={handleValidateSystem}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Validate System
            </Button>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSyncRunning}
            >
              {isSyncRunning ? 'Please wait...' : 'Close'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};