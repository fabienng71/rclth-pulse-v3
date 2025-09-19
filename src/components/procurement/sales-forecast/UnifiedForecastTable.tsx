
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, Calendar, AlertCircle, Users } from 'lucide-react';
import { useVendorItems } from '@/hooks/useVendorItems';
import { useSalesForecastSave } from '@/hooks/useSalesForecastSave';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ForecastMetricsCard } from './ForecastMetricsCard';
import { CollaborativeForecastData } from '@/hooks/useForecastSessions';

interface SelectedVendor {
  vendor_code: string;
  vendor_name: string;
}

interface UnifiedForecastTableProps {
  vendor: SelectedVendor;
  onReset: () => void;
  isCollaborative?: boolean;
  sessionId?: string;
  existingForecasts?: CollaborativeForecastData[];
  onSave?: () => void;
}

interface ItemForecastData {
  quantity: number;
  notes: string;
}

interface ForecastData {
  [itemCode: string]: ItemForecastData;
}

export const UnifiedForecastTable: React.FC<UnifiedForecastTableProps> = ({
  vendor,
  onReset,
  isCollaborative = false,
  sessionId,
  existingForecasts = [],
  onSave
}) => {
  const { user } = useAuthStore();
  const { items, loading, error } = useVendorItems(vendor.vendor_code);
  const { saveForecast, saveCollaborativeForecast, saving, error: saveError, clearError } = useSalesForecastSave();
  const [forecastData, setForecastData] = useState<ForecastData>({});
  const [etaDate, setEtaDate] = useState<string>('');

  const updateForecastItem = (itemCode: string, field: keyof ItemForecastData, value: string | number) => {
    setForecastData(prev => ({
      ...prev,
      [itemCode]: {
        quantity: 0,
        notes: '',
        ...prev[itemCode],
        [field]: value
      }
    }));
    
    if (saveError) {
      clearError();
    }
  };

  // Get existing forecasts for an item from collaborative data
  const getExistingForecasts = (itemCode: string) => {
    return existingForecasts.filter(f => f.item_code === itemCode);
  };

  // Calculate metrics
  const totalQuantity = Object.values(forecastData).reduce((sum, item) => sum + item.quantity, 0);
  const totalSkus = Object.values(forecastData).filter(item => item.quantity > 0).length;

  const handleSaveForecast = async () => {
    try {
      const forecasts = Object.entries(forecastData)
        .filter(([_, data]) => data.quantity > 0)
        .map(([itemCode, data]) => ({
          vendor_code: vendor.vendor_code,
          item_code: itemCode,
          forecast_quantity: data.quantity,
          eta_date: etaDate || null,
          notes: data.notes || null,
          salesperson_id: user?.id || null
        }));

      if (forecasts.length === 0) {
        toast.error('Please enter at least one forecast quantity');
        return;
      }

      if (isCollaborative && sessionId) {
        await saveCollaborativeForecast(sessionId, forecasts);
        toast.success(`Collaborative forecast saved for ${forecasts.length} items`);
        if (onSave) onSave();
      } else {
        await saveForecast(forecasts);
        toast.success(`Sales forecast saved for ${forecasts.length} items`);
        onReset();
      }
    } catch (error) {
      console.error('Error saving forecast:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading items...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading items: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCollaborative && <Users className="h-5 w-5" />}
          {isCollaborative ? 'Collaborative' : 'Individual'} Forecast Items for {vendor.vendor_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ETA Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eta-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Expected Delivery Date (ETA) for entire forecast
              </Label>
              <Input
                id="eta-date"
                type="date"
                value={etaDate}
                onChange={(e) => setEtaDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Save Error Display */}
          {saveError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {saveError}
              </AlertDescription>
            </Alert>
          )}

          {/* Metrics Card */}
          {totalQuantity > 0 && (
            <ForecastMetricsCard 
              totalQuantity={totalQuantity} 
              totalSkus={totalSkus} 
            />
          )}

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items found for this vendor.
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead className="min-w-[300px]">Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Current Stock</TableHead>
                      {isCollaborative && <TableHead>Existing Forecasts</TableHead>}
                      <TableHead>Your Forecast Qty</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const existingItemForecasts = getExistingForecasts(item.item_code);
                      const totalExisting = existingItemForecasts.reduce((sum, f) => sum + (f.forecast_quantity || 0), 0);
                      
                      return (
                        <TableRow key={item.item_code}>
                          <TableCell className="font-mono text-sm">
                            {item.item_code}
                          </TableCell>
                          <TableCell className="min-w-[300px]">
                            <div className="text-sm leading-relaxed" title={item.description}>
                              {item.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.base_unit_code}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {item.current_stock ?? 0}
                            </Badge>
                          </TableCell>
                          {isCollaborative && (
                            <TableCell>
                              {existingItemForecasts.length > 0 ? (
                                <div className="space-y-1">
                                  {existingItemForecasts.map((forecast, idx) => (
                                    <div key={idx} className="text-xs text-muted-foreground">
                                      {forecast.contributor_name || forecast.contributor_email}: {forecast.forecast_quantity}
                                    </div>
                                  ))}
                                  <Badge variant="outline" className="font-semibold">
                                    Total: {totalExisting}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">None</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              className="w-24"
                              value={forecastData[item.item_code]?.quantity || ''}
                              onChange={(e) => updateForecastItem(
                                item.item_code, 
                                'quantity', 
                                parseInt(e.target.value) || 0
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              placeholder="Optional notes"
                              className="w-40"
                              value={forecastData[item.item_code]?.notes || ''}
                              onChange={(e) => updateForecastItem(
                                item.item_code, 
                                'notes', 
                                e.target.value
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onReset}>
                  Cancel
                </Button>
                <Button onClick={handleSaveForecast} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Forecast
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
