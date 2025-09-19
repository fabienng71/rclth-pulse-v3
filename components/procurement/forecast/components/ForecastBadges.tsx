
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Ship, Calendar, Package } from 'lucide-react';

export const getConfidenceBadge = (score: number) => {
  if (score >= 0.8) {
    return <Badge variant="default" className="bg-green-100 text-green-800">High ({Math.round(score * 100)}%)</Badge>;
  } else if (score >= 0.6) {
    return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium ({Math.round(score * 100)}%)</Badge>;
  } else {
    return <Badge variant="destructive" className="bg-red-100 text-red-800">Low ({Math.round(score * 100)}%)</Badge>;
  }
};

export const getStockStatusBadge = (status: string, daysUntilStockout: number) => {
  switch (status) {
    case 'critical':
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Critical ({daysUntilStockout}d)</Badge>;
    case 'low':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Low ({daysUntilStockout}d)</Badge>;
    case 'normal':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Normal ({daysUntilStockout}d)</Badge>;
    default:
      return <Badge variant="default" className="bg-green-100 text-green-800">High ({daysUntilStockout}d)</Badge>;
  }
};

export const getIncomingStockBadge = (incomingTotal: number, items: any[], formatOrderDate: (dateString: string) => string) => {
  // Enhanced debugging for incoming stock badge
  console.log(`[IncomingStockBadge] Processing:`, {
    incomingTotal,
    itemsCount: items?.length || 0,
    items: items
  });

  const safeIncomingTotal = incomingTotal || 0;
  const safeItems = items || [];
  
  if (safeIncomingTotal === 0 || safeItems.length === 0) {
    console.log(`[IncomingStockBadge] No incoming stock detected`);
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Package className="h-4 w-4" />
        <span className="text-sm">None</span>
      </div>
    );
  }

  // Sort items by ETA to get the earliest delivery
  const sortedItems = safeItems
    .filter(item => {
      const hasEta = item.eta && item.eta.trim() !== '';
      console.log(`[IncomingStockBadge] Item ETA check:`, {
        eta: item.eta,
        hasEta,
        quantity: item.quantity
      });
      return hasEta;
    })
    .sort((a, b) => new Date(a.eta).getTime() - new Date(b.eta).getTime());

  const nextDelivery = sortedItems[0];
  const totalShipments = safeItems.length;

  console.log(`[IncomingStockBadge] Processed incoming stock:`, {
    nextDelivery,
    totalShipments,
    sortedItemsCount: sortedItems.length
  });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Ship className="h-4 w-4 text-blue-500" />
        <span className="font-medium text-blue-700">{safeIncomingTotal.toLocaleString()}</span>
        <span className="text-xs text-gray-500">units</span>
      </div>
      
      {nextDelivery && (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-600">
            Next: {formatOrderDate(nextDelivery.eta)}
          </span>
        </div>
      )}
      
      {totalShipments > 1 && (
        <span className="text-xs text-gray-500">
          +{totalShipments - 1} more shipment{totalShipments > 2 ? 's' : ''}
        </span>
      )}
    </div>
  );
};
