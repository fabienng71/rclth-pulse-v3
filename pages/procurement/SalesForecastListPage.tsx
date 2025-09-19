
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Eye, Trash2, Archive, ChevronDown, ChevronRight, Users, Package } from 'lucide-react';
import { useForecastSessions, type ForecastSession, type CollaborativeForecastData } from '@/hooks/useForecastSessions';
import { DeleteForecastDialog } from '@/components/procurement/sales-forecast/DeleteForecastDialog';
import { ArchiveForecastDialog } from '@/components/procurement/sales-forecast/ArchiveForecastDialog';
import { toast } from 'sonner';
import { CleanFragment } from '@/components/ui/clean-fragment';

interface SessionWithDetails extends ForecastSession {
  vendor_name?: string;
  total_items?: number;
  total_quantity?: number;
  forecasts?: CollaborativeForecastData[];
}

const SalesForecastListPage = () => {
  const navigate = useNavigate();
  const { 
    sessions, 
    loading, 
    error, 
    fetchSessions, 
    deleteSession, 
    archiveSession,
    getCollaborativeData 
  } = useForecastSessions();

  const [sessionsWithDetails, setSessionsWithDetails] = useState<SessionWithDetails[]>([]);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; sessionId: string }>({
    open: false,
    sessionId: ''
  });
  const [archiveDialog, setArchiveDialog] = useState<{ 
    open: boolean; 
    sessionId: string; 
    isArchived: boolean 
  }>({
    open: false,
    sessionId: '',
    isArchived: false
  });

  useEffect(() => {
    const enrichSessions = async () => {
      if (!sessions.length) return;

      const enriched = await Promise.all(
        sessions.map(async (session) => {
          try {
            const collaborativeData = await getCollaborativeData(session.id);
            
            // Get vendor name from first forecast item or use session vendor_code
            const vendorName = collaborativeData.length > 0 
              ? collaborativeData[0].vendor_code 
              : session.vendor_code;

            // Calculate totals
            const totalItems = collaborativeData.filter(item => item.forecast_id).length;
            const totalQuantity = collaborativeData.reduce((sum, item) => 
              sum + (item.forecast_quantity || 0), 0
            );

            return {
              ...session,
              vendor_name: vendorName,
              total_items: totalItems,
              total_quantity: totalQuantity,
              forecasts: collaborativeData
            } as SessionWithDetails;
          } catch (error) {
            console.error(`Error enriching session ${session.id}:`, error);
            return {
              ...session,
              vendor_name: session.vendor_code,
              total_items: 0,
              total_quantity: 0,
              forecasts: []
            } as SessionWithDetails;
          }
        })
      );

      setSessionsWithDetails(enriched);
    };

    enrichSessions();
  }, [sessions, getCollaborativeData]);

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      toast.success('Forecast session deleted successfully');
      setDeleteDialog({ open: false, sessionId: '' });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete forecast session');
    }
  };

  const handleArchive = async (sessionId: string, archive: boolean) => {
    try {
      await archiveSession(sessionId, archive);
      toast.success(`Forecast session ${archive ? 'archived' : 'unarchived'} successfully`);
      setArchiveDialog({ open: false, sessionId: '', isArchived: false });
    } catch (error) {
      console.error('Error archiving session:', error);
      toast.error(`Failed to ${archive ? 'archive' : 'unarchive'} forecast session`);
    }
  };

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center">Loading forecast sessions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen app-background">
        <Navigation />
        <div className="container py-10">
          <div className="text-center text-red-600">Error: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-background">
      <Navigation />
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="section-background p-6 flex-1 mr-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Sales Forecast Sessions
            </h1>
            <p className="text-muted-foreground text-xl">
              Manage collaborative sales forecasting sessions by vendor
            </p>
          </div>
          <Button onClick={() => navigate('/procurement/sales-forecasts/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Session
          </Button>
        </div>

        <Card variant="enhanced">
          <CardHeader>
            <CardTitle>Forecast Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsWithDetails.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No forecast sessions found</p>
                <Button onClick={() => navigate('/procurement/sales-forecasts/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Session
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Session Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>ETA Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionsWithDetails.map((session) => (
                    <CleanFragment fragmentKey={session.id}>
                      <TableRow>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSessionExpansion(session.id)}
                          >
                            {expandedSessions.has(session.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{session.session_name}</div>
                            {session.notes && (
                              <div className="text-sm text-muted-foreground">
                                {session.notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{session.vendor_name || session.vendor_code}</TableCell>
                        <TableCell>
                          {session.eta_date ? formatDate(session.eta_date) : 'Not set'}
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {session.total_items || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.total_quantity?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>{formatDate(session.created_at)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{session.creator_name || 'Unknown'}</div>
                            <div className="text-muted-foreground">
                              {session.creator_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/procurement/sales-forecasts/${session.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setArchiveDialog({
                                open: true,
                                sessionId: session.id,
                                isArchived: session.status === 'archived'
                              })}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, sessionId: session.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedSessions.has(session.id) && session.forecasts && session.forecasts.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="p-0">
                            <div className="bg-muted/50 p-4">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Individual Forecasts ({session.forecasts.filter(f => f.forecast_id).length})
                              </h4>
                              <div className="grid gap-2">
                                {session.forecasts
                                  .filter(forecast => forecast.forecast_id)
                                  .map((forecast) => (
                                    <div
                                      key={forecast.forecast_id}
                                      className="flex justify-between items-center bg-background p-3 rounded border"
                                    >
                                      <div>
                                        <div className="font-medium">
                                          {forecast.item_code} - {forecast.item_description}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          Contributor: {forecast.contributor_name} ({forecast.contributor_email})
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">
                                          Qty: {forecast.forecast_quantity?.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {forecast.forecast_created_at ? formatDate(forecast.forecast_created_at) : ''}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </CleanFragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteForecastDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, sessionId: '' })}
        onConfirm={() => handleDelete(deleteDialog.sessionId)}
      />

      <ArchiveForecastDialog
        open={archiveDialog.open}
        onOpenChange={(open) => setArchiveDialog({ open, sessionId: '', isArchived: false })}
        onConfirm={() => handleArchive(archiveDialog.sessionId, !archiveDialog.isArchived)}
        action={archiveDialog.isArchived ? 'unarchive' : 'archive'}
      />
    </div>
  );
};

export default SalesForecastListPage;
