import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProcessedTopNData } from '@/hooks/useTopNCustomersData';
import { Info, Database, Users, AlertTriangle } from 'lucide-react';

interface TopNDataInfoProps {
  data: ProcessedTopNData;
  topN: number;
  className?: string;
}

export const TopNDataInfo: React.FC<TopNDataInfoProps> = ({ data, topN, className = '' }) => {
  if (!data.pagination) {
    return null;
  }

  const { pagination, isPartialData } = data;
  const showingCount = data.customers.length;
  const totalAvailable = pagination.totalCount;
  const isLimitedByRequest = showingCount >= topN;
  const isLimitedByData = totalAvailable < topN;

  return (
    <Card className={`border-l-4 ${isPartialData ? 'border-l-amber-500' : 'border-l-blue-500'} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isPartialData ? (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            ) : (
              <Info className="h-5 w-5 text-blue-500" />
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Showing {showingCount.toLocaleString()}
              </Badge>
              
              {isLimitedByRequest && !isLimitedByData && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  of {totalAvailable.toLocaleString()} available
                </Badge>
              )}
              
              {isLimitedByData && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {totalAvailable.toLocaleString()} total customers
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isPartialData ? (
                <>
                  <span className="font-medium text-amber-700">Data Notice:</span> 
                  {' '}You requested {topN.toLocaleString()} customers, but only {showingCount.toLocaleString()} are shown. 
                  {totalAvailable > showingCount && (
                    <> There are {totalAvailable.toLocaleString()} customers available in total.</>
                  )}
                </>
              ) : isLimitedByRequest ? (
                <>
                  <span className="font-medium text-blue-700">Complete Data:</span> 
                  {' '}Showing top {topN.toLocaleString()} customers as requested.
                  {totalAvailable > topN && (
                    <> {(totalAvailable - topN).toLocaleString()} more customers are available.
                  </>
                  )}
                </>
              ) : (
                <>
                  <span className="font-medium text-blue-700">Complete Data:</span> 
                  {' '}All {totalAvailable.toLocaleString()} customers are shown.
                </>
              )}
            </div>
            
            {showingCount >= 1000 && (
              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                <span className="font-medium">Performance Tip:</span> Use the virtualized table view for better performance with large datasets.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};