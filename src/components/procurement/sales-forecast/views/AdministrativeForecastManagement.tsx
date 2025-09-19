import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { DeleteForecastDialog } from '../DeleteForecastDialog';
import { ArchiveForecastDialog } from '../ArchiveForecastDialog';
import { useSalesForecastManagement } from '@/hooks/useSalesForecastManagement';
import { toast } from 'sonner';

export const AdministrativeForecastManagement: React.FC = () => {
  const { forecasts, loading: managementLoading, fetchForecasts, deleteForecast, archiveForecast } = useSalesForecastManagement();
  const [showManagement, setShowManagement] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [selectedForecastForAction, setSelectedForecastForAction] = useState<string | null>(null);
  const [archiveAction, setArchiveAction] = useState<'archive' | 'unarchive'>('archive');

  React.useEffect(() => {
    if (showManagement) {
      fetchForecasts('active');
    }
  }, [showManagement]);

  const handleDeleteForecast = (forecastId: string) => {
    setSelectedForecastForAction(forecastId);
    setDeleteDialogOpen(true);
  };

  const handleArchiveForecast = (forecastId: string, action: 'archive' | 'unarchive') => {
    setSelectedForecastForAction(forecastId);
    setArchiveAction(action);
    setArchiveDialogOpen(true);
  };

  const confirmDeleteForecast = async () => {
    if (!selectedForecastForAction) return;
    
    try {
      await deleteForecast(selectedForecastForAction);
      toast.success('Forecast deleted successfully');
      fetchForecasts('active');
    } catch (error) {
      toast.error('Failed to delete forecast');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedForecastForAction(null);
    }
  };

  const confirmArchiveForecast = async () => {
    if (!selectedForecastForAction) return;
    
    try {
      await archiveForecast(selectedForecastForAction, archiveAction === 'archive');
      toast.success(`Forecast ${archiveAction}d successfully`);
      fetchForecasts('active');
    } catch (error) {
      toast.error(`Failed to ${archiveAction} forecast`);
    } finally {
      setArchiveDialogOpen(false);
      setSelectedForecastForAction(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Forecast Management
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowManagement(!showManagement)}
            >
              {showManagement ? 'Hide' : 'Show'} Existing Forecasts
            </Button>
          </div>
        </CardHeader>
        <Collapsible open={showManagement} onOpenChange={setShowManagement}>
          <CollapsibleContent>
            <CardContent>
              {managementLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading forecasts...</span>
                </div>
              ) : forecasts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active forecasts found.
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>ETA Date</TableHead>
                        <TableHead>Salesperson</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forecasts.map((forecast) => (
                        <TableRow key={forecast.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{forecast.vendor_code}</div>
                              <div className="text-sm text-muted-foreground">{forecast.vendor_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{forecast.item_code}</div>
                              <div className="text-sm text-muted-foreground">{forecast.item_description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {forecast.forecast_quantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {forecast.eta_date ? new Date(forecast.eta_date).toLocaleDateString() : 'Not set'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{forecast.salesperson_name || 'Unknown'}</div>
                              <div className="text-muted-foreground">{forecast.salesperson_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={forecast.status === 'active' ? 'default' : 'secondary'}>
                              {forecast.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleArchiveForecast(forecast.id, 'archive')}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteForecast(forecast.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Confirmation Dialogs */}
      <DeleteForecastDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteForecast}
      />

      <ArchiveForecastDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={confirmArchiveForecast}
        action={archiveAction}
      />
    </>
  );
};