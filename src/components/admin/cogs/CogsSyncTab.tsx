import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SyncStatusDisplay } from './SyncStatusDisplay';
import { useCogsSync } from '@/hooks/useCogsSync';

export const CogsSyncTab: React.FC = () => {
  const { 
    syncIssues, 
    refreshValidation, 
    refreshMaster, 
    isRefreshing, 
    isValidating 
  } = useCogsSync();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Synchronization Management
          </CardTitle>
          <CardDescription>
            Manage synchronization between the cogs and cogs_master tables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => refreshMaster()}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRefreshing ? 'Refreshing...' : 'Refresh Master Table'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => refreshValidation()}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {isValidating ? 'Validating...' : 'Validate Sync'}
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Refreshing the master table will replace all current master data with the latest values from the COGS table. 
              This operation may take several minutes for large datasets.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Synchronization Status</CardTitle>
          <CardDescription>
            Review items that may have synchronization issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SyncStatusDisplay issues={syncIssues} />
        </CardContent>
      </Card>
    </div>
  );
};