import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, CheckCircle2, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
import { useCogsSync } from '@/hooks/useCogsSync';

export const SyncStatsDisplay: React.FC = () => {
  const { syncStats, isLoadingStats } = useCogsSync();

  if (isLoadingStats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!syncStats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to Load Statistics</AlertTitle>
        <AlertDescription>
          Failed to fetch COGS synchronization statistics.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{syncStats.total_items_in_cogs}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{syncStats.items_in_master}</div>
              <div className="text-sm text-muted-foreground">In Master</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{syncStats.unsynced_items}</div>
              <div className="text-sm text-muted-foreground">Out of Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">{syncStats.sync_percentage}%</div>
              <div className="text-sm text-muted-foreground">Synchronized</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};