
// Update imports to use the new types directory structure
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MarginOverallData, ViewMode } from './types';

interface DirectMarginSummaryCardProps {
  data: MarginOverallData | null;
  year: number;
  month: number;
  isLoading: boolean;
  viewMode?: ViewMode;
}

export const DirectMarginSummaryCard: React.FC<DirectMarginSummaryCardProps> = ({ data, year, month, isLoading, viewMode = 'standard' }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="skeleton"><Skeleton className="h-6 w-1/2" /></CardTitle>
          <CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Total Sales</div>
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Total Cost</div>
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Margin</div>
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Margin %</div>
              <Skeleton className="h-4 w-32" />
            </div>
            {viewMode === 'adjusted' && (
              <>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Adjusted Sales</div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Adjusted Margin</div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Adjusted Margin %</div>
                  <Skeleton className="h-4 w-32" />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Margin Summary</CardTitle>
          <CardDescription>No data available for {month}/{year}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No margin data to display for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Margin Summary</CardTitle>
        <CardDescription>Overview of margin performance for {month}/{year}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Total Sales</div>
            <div className="text-2xl font-bold">{formatCurrency(data.total_sales)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Total Cost</div>
            <div className="text-2xl font-bold">{formatCurrency(data.total_cost)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Margin</div>
            <div className="text-2xl font-bold">{formatCurrency(data.margin)}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Margin %</div>
            <div className="text-2xl font-bold">{formatPercentage(data.margin_percent)}</div>
          </div>
          {viewMode === 'adjusted' && data.adjusted_sales !== undefined && (
            <>
              <div className="space-y-2">
                <div className="text-sm font-medium">Adjusted Sales</div>
                <div className="text-2xl font-bold">{formatCurrency(data.adjusted_sales)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Adjusted Margin</div>
                <div className="text-2xl font-bold">{formatCurrency(data.adjusted_margin || 0)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Adjusted Margin %</div>
                <div className="text-2xl font-bold">{formatPercentage(data.adjusted_margin_percent || 0)}</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
