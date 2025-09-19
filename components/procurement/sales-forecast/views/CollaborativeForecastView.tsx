import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VendorSelectionSection } from '../VendorSelectionSection';
import { UnifiedForecastTable } from '../UnifiedForecastTable';
import { ForecastSessionMetrics } from '../ForecastSessionMetrics';
import { ForecastSession } from '@/hooks/useForecastSessions';

interface SelectedVendor {
  vendor_code: string;
  vendor_name: string;
}

interface CollaborativeForecastViewProps {
  selectedSession: ForecastSession;
  selectedVendor: SelectedVendor | null;
  collaborativeData: any[];
  onVendorSelect: (vendor: SelectedVendor) => void;
  onReset: () => void;
  onSave: () => Promise<void>;
}

export const CollaborativeForecastView: React.FC<CollaborativeForecastViewProps> = ({
  selectedSession,
  selectedVendor,
  collaborativeData,
  onVendorSelect,
  onReset,
  onSave
}) => {
  // Calculate metrics for collaborative session
  const getSessionMetrics = () => {
    if (!collaborativeData || collaborativeData.length === 0) {
      return { totalSkus: 0, totalQuantity: 0 };
    }

    const uniqueItems = new Set();
    let totalQuantity = 0;

    collaborativeData.forEach(item => {
      if (item.item_code && item.forecast_quantity) {
        uniqueItems.add(item.item_code);
        totalQuantity += item.forecast_quantity;
      }
    });

    return {
      totalSkus: uniqueItems.size,
      totalQuantity
    };
  };

  const metrics = getSessionMetrics();
  
  // Check if session has a vendor already set
  const sessionVendor = selectedSession.vendor_code ? {
    vendor_code: selectedSession.vendor_code,
    vendor_name: selectedSession.vendor_code // We'll use vendor_code as name for now
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Collaborative Forecast Session</h3>
          <ForecastSessionMetrics 
            totalSkus={metrics.totalSkus}
            totalQuantity={metrics.totalQuantity}
          />
        </div>
        <Button variant="outline" onClick={onReset}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Start
        </Button>
      </div>

      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">{selectedSession.session_name}</h4>
              <div className="text-sm text-muted-foreground">
                Vendor: {selectedSession.vendor_code} • Created by: {selectedSession.creator_name || selectedSession.creator_email}
              </div>
              {selectedSession.eta_date && (
                <div className="text-sm text-muted-foreground">
                  ETA: {new Date(selectedSession.eta_date).toLocaleDateString()}
                </div>
              )}
            </div>
            <Badge variant={selectedSession.status === 'active' ? 'default' : 'secondary'}>
              {selectedSession.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Vendor Selection or Items Table */}
      {!sessionVendor ? (
        <VendorSelectionSection 
          selectedVendor={selectedVendor}
          onVendorSelect={onVendorSelect}
        />
      ) : null}

      {(sessionVendor || selectedVendor) && (
        <UnifiedForecastTable 
          vendor={sessionVendor || selectedVendor!}
          onReset={onReset}
          isCollaborative={true}
          sessionId={selectedSession.id}
          existingForecasts={collaborativeData}
          onSave={onSave}
        />
      )}
    </div>
  );
};