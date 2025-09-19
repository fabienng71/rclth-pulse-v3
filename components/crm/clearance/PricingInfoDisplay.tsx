
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PricingInfoDisplayProps {
  unitPrice: number | null;
  cogsUnit: number | null;
  marginPercent: number | null;
  isLoading: boolean;
  hasSelectedItem: boolean;
}

export const PricingInfoDisplay: React.FC<PricingInfoDisplayProps> = ({
  unitPrice,
  cogsUnit,
  marginPercent,
  isLoading,
  hasSelectedItem
}) => {
  if (!hasSelectedItem) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Pricing Information</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-700 mb-1">Unit Price</p>
              <Skeleton className="h-5 w-16" />
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1">COGS</p>
              <Skeleton className="h-5 w-16" />
            </div>
            <div>
              <p className="text-xs text-blue-700 mb-1">Margin</p>
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatMargin = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const getMarginColor = (margin: number | null) => {
    if (margin === null) return 'text-gray-600';
    if (margin > 20) return 'text-green-600';
    if (margin > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-4">
        <h4 className="text-sm font-medium text-blue-900 mb-3">Pricing Information</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-blue-700 mb-1">Unit Price</p>
            <p className="text-sm font-medium text-blue-900">
              {formatNumber(unitPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-700 mb-1">COGS</p>
            <p className="text-sm font-medium text-blue-900">
              {formatNumber(cogsUnit)}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-700 mb-1">Margin</p>
            <p className={`text-sm font-medium ${getMarginColor(marginPercent)}`}>
              {formatMargin(marginPercent)}
            </p>
          </div>
        </div>
        {unitPrice === null || cogsUnit === null ? (
          <p className="text-xs text-blue-600 mt-2">
            {unitPrice === null && cogsUnit === null ? 
              'No pricing data available for this item' :
              unitPrice === null ? 
                'Unit price not available' : 
                'COGS data not available'
            }
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};
