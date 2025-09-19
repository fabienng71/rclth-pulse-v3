import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Trash2 } from 'lucide-react';
import { useStockFilterDebug, useResetStockFilters } from '@/hooks/usePersistedStockFilters';
import { clearStockFilters } from '@/utils/stockFilterStorage';

interface StockFilterDebugProps {
  onReset?: () => void;
}

/**
 * Debug component for stock filter persistence
 * Only visible in development or when explicitly shown
 */
export const StockFilterDebug: React.FC<StockFilterDebugProps> = ({ onReset }) => {
  const debugInfo = useStockFilterDebug();
  const resetFilters = useResetStockFilters();

  const handleClearStorage = () => {
    clearStockFilters();
    if (onReset) {
      onReset();
    }
    // Force a page refresh to show the cleared state
    window.location.reload();
  };

  const handleResetToDefaults = () => {
    const defaults = resetFilters();
    if (onReset) {
      onReset();
    }
    console.log('Filters reset to defaults:', defaults);
  };

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="mb-4 border-dashed border-yellow-300 bg-yellow-50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-yellow-600" />
          <CardTitle className="text-sm text-yellow-800">
            Stock Filter Debug Info
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <strong>localStorage:</strong>{' '}
            <Badge variant={debugInfo.isLocalStorageAvailable ? 'default' : 'destructive'}>
              {debugInfo.isLocalStorageAvailable ? 'Available' : 'Not Available'}
            </Badge>
          </div>
          <div>
            <strong>Stored Data:</strong>{' '}
            <Badge variant={debugInfo.hasStoredData ? 'default' : 'secondary'}>
              {debugInfo.hasStoredData ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div>
            <strong>Storage Key:</strong>{' '}
            <code className="text-xs bg-gray-200 px-1 rounded">
              {debugInfo.storageKey}
            </code>
          </div>
          <div>
            <strong>Current Filters:</strong>
            <div className="mt-1 space-y-1">
              {Object.entries(debugInfo.currentFilters).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1">
                  <code className="text-xs">{key}:</code>
                  <Badge variant={value ? 'default' : 'outline'} className="text-xs">
                    {String(value)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearStorage}
            className="flex items-center gap-1 text-xs"
          >
            <Trash2 className="h-3 w-3" />
            Clear Storage
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetToDefaults}
            className="text-xs"
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};