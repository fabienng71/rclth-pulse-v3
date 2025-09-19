
import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package, Calendar, MessageSquare } from 'lucide-react';
import { CollaborativeForecastData } from '@/hooks/useForecastSessions';
import { EnhancedContributorDisplay } from './EnhancedContributorDisplay';
import { Badge } from '@/components/ui/badge';

interface ForecastItemRowProps {
  itemCode: string;
  forecasts: CollaborativeForecastData[];
}

export const ForecastItemRow: React.FC<ForecastItemRowProps> = ({
  itemCode,
  forecasts
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalQuantity = forecasts.reduce((sum, f) => sum + (f.forecast_quantity || 0), 0);
  const description = forecasts[0]?.item_description || '';
  const hasNotes = forecasts.some(f => f.item_notes && f.item_notes.trim() !== '');

  return (
    <>
      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setIsExpanded(!isExpanded)}>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{itemCode}</span>
            </div>
          </div>
        </TableCell>
        <TableCell>{description}</TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Badge variant="outline" className="font-bold">
              {totalQuantity.toLocaleString()}
            </Badge>
            {hasNotes && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{forecasts.length} contributor{forecasts.length !== 1 ? 's' : ''}</Badge>
          </div>
        </TableCell>
      </TableRow>
      
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="p-0">
            <div className="px-4 py-6 bg-muted/20 border-t">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Detailed Forecast Breakdown</span>
                </div>
                
                <EnhancedContributorDisplay forecasts={forecasts} />
                
                {hasNotes && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Notes:</h4>
                    <div className="space-y-2">
                      {forecasts
                        .filter(f => f.item_notes && f.item_notes.trim() !== '')
                        .map((forecast, index) => (
                          <div key={index} className="p-3 bg-background rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {forecast.contributor_name || forecast.contributor_email}
                              </span>
                              {forecast.forecast_created_at && (
                                <span className="text-xs text-muted-foreground">
                                  {new Date(forecast.forecast_created_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{forecast.item_notes}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
