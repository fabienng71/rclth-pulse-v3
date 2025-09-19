
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Database, RefreshCw, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { format } from 'date-fns';
import AdminGuard from '@/components/security/AdminGuard';

interface SyncLog {
  id: string;
  sync_type: string;
  status: 'success' | 'partial' | 'failed';
  records_processed: number | null;
  records_updated: number | null;
  records_inserted: number | null;
  errors: any;
  sync_duration_ms: number | null;
  created_at: string;
  synced_by: string | null;
}

const SyncLogs = () => {
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);
  const { isAdmin } = useAuthStore();

  const { data: syncLogs, isLoading, refetch } = useQuery({
    queryKey: ['sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching sync logs:', error);
        throw error;
      }
      
      // Transform the data to ensure proper typing
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'success' | 'partial' | 'failed'
      }));
    },
    enabled: isAdmin,
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access sync logs.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sync Logs</h1>
            <p className="text-muted-foreground mt-1">
              View history of data synchronization operations
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sync Logs List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Operations</CardTitle>
              <CardDescription>Latest data synchronization activities</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading sync logs...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {syncLogs?.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedLog?.id === log.id ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="font-medium capitalize">
                            {log.sync_type.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.created_at), 'HH:mm')}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        Processed: {log.records_processed || 0} | Updated: {log.records_updated || 0} | Inserted: {log.records_inserted || 0}
                      </div>
                    </div>
                  ))}
                  {syncLogs?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sync logs found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sync Log Details */}
          <Card>
            <CardHeader>
              <CardTitle>Sync Details</CardTitle>
              <CardDescription>
                {selectedLog ? 'Detailed information about the selected sync operation' : 'Select a sync operation to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedLog ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedLog.status)}
                        <Badge className={getStatusColor(selectedLog.status)}>
                          {selectedLog.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Duration</label>
                      <p className="mt-1">{selectedLog.sync_duration_ms || 0}ms</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Records Processed</label>
                      <p className="mt-1">{selectedLog.records_processed || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Records Updated</label>
                      <p className="mt-1">{selectedLog.records_updated || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Records Inserted</label>
                      <p className="mt-1">{selectedLog.records_inserted || 0}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Synced By</label>
                      <p className="mt-1">{selectedLog.synced_by || 'Unknown'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                    <p className="mt-1">{format(new Date(selectedLog.created_at), 'PPpp')}</p>
                  </div>

                  {selectedLog.errors && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Errors ({Array.isArray(selectedLog.errors) ? selectedLog.errors.length : 'N/A'})
                      </label>
                      <div className="mt-2 max-h-64 overflow-y-auto">
                        {Array.isArray(selectedLog.errors) ? (
                          selectedLog.errors.map((error: any, index: number) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded p-3 mb-2">
                              <div className="text-sm">
                                {typeof error === 'object' ? (
                                  <>
                                    <strong>Row {error.row || 'N/A'}:</strong> {error.error || JSON.stringify(error)}
                                    {error.item_code && <span className="ml-2 text-muted-foreground">({error.item_code})</span>}
                                  </>
                                ) : (
                                  <span>{String(error)}</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <div className="text-sm">
                              {typeof selectedLog.errors === 'string' 
                                ? selectedLog.errors 
                                : JSON.stringify(selectedLog.errors)
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a sync operation from the list to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AdminGuard>
  );
};

export default SyncLogs;
