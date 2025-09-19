
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, Calendar, AlertCircle } from 'lucide-react';
import { useVendorItems } from '@/hooks/useVendorItems';
import { useSalesForecastSave } from '@/hooks/useSalesForecastSave';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { ForecastMetricsCard } from './ForecastMetricsCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SelectedVendor {
  vendor_code: string;
  vendor_name: string;
}

interface ItemsForecastSectionProps {
  vendor: SelectedVendor;
  onReset: () => void;
}

interface ItemForecastData {
  quantity: number;
  notes: string;
}

interface ForecastData {
  [itemCode: string]: ItemForecastData;
}

export const ItemsForecastSection: React.FC<ItemsForecastSectionProps> = ({
  vendor,
  onReset
}) => {
  const { user } = useAuthStore();
  const { items, loading, error } = useVendorItems(vendor.vendor_code);
  const { saveForecast, saving, error: saveError, clearError } = useSalesForecastSave();
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
    
    // Clear save error when user makes changes
    if (saveError) {
      clearError();
    }
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

      await saveForecast(forecasts);
      toast.success(`Sales forecast saved for ${forecasts.length} items`);
      onReset();
    } catch (error) {
      console.error('Error saving forecast:', error);
      // Error is already handled by the hook and displayed via saveError state
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
        <CardTitle>Step 2: Forecast Items for {vendor.vendor_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ETA Date Section - Now at forecast level */}
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
                      <TableHead>Description</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Forecast Qty</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.item_code}>
                        <TableCell className="font-mono text-sm">
                          {item.item_code}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={item.description}>
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
                    ))}
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
