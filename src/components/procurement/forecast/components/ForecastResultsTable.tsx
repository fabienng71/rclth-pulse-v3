
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Truck, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ForecastResult } from '@/types/forecast';
import { getConfidenceBadge, getStockStatusBadge, getIncomingStockBadge } from './ForecastBadges';
import ForecastTrendIcon from './ForecastTrendIcon';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { useSortableTable } from '@/hooks/useSortableTable';

interface ForecastResultsTableProps {
  results: ForecastResult[];
}

type SortField = 'item_code' | 'description' | 'monthly_consumption' | 'current_stock' | 'incoming_stock_total' | 'predicted_quantity' | 'stock_status' | 'effective_days_until_stockout' | 'confidence_score' | 'recommended_order_date' | 'estimated_arrival_date';

const ForecastResultsTable: React.FC<ForecastResultsTableProps> = ({ results }) => {
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('item_code');

  // Enhanced debugging for the results table
  console.log(`[ForecastResultsTable] Rendering table with ${results.length} results`);
  
  results.forEach((result, index) => {
    if (result.item_code === 'IPS0WW0000547' || (result.incoming_stock_total || 0) > 0) {
      console.log(`[ForecastResultsTable] Item ${index + 1} (${result.item_code}):`, {
        incoming_stock_total: result.incoming_stock_total,
        incoming_stock_items: result.incoming_stock_items,
        stock_status: result.stock_status,
        effective_days_until_stockout: result.effective_days_until_stockout,
        days_until_stockout: result.days_until_stockout
      });
    }
  });

  // Sort the results based on the current sort field and direction
  const sortedResults = React.useMemo(() => {
    return [...results].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'item_code':
          return (a.item_code > b.item_code ? 1 : -1) * direction;
        case 'description':
          return (a.description > b.description ? 1 : -1) * direction;
        case 'monthly_consumption':
          return (a.monthly_consumption - b.monthly_consumption) * direction;
        case 'current_stock':
          return (a.current_stock - b.current_stock) * direction;
        case 'incoming_stock_total':
          return ((a.incoming_stock_total || 0) - (b.incoming_stock_total || 0)) * direction;
        case 'predicted_quantity':
          return (a.predicted_quantity - b.predicted_quantity) * direction;
        case 'stock_status':
          return (a.stock_status > b.stock_status ? 1 : -1) * direction;
        case 'effective_days_until_stockout':
          return (a.effective_days_until_stockout - b.effective_days_until_stockout) * direction;
        case 'confidence_score':
          return (a.confidence_score - b.confidence_score) * direction;
        case 'recommended_order_date':
          return (new Date(a.recommended_order_date).getTime() - new Date(b.recommended_order_date).getTime()) * direction;
        case 'estimated_arrival_date':
          return (new Date(a.estimated_arrival_date).getTime() - new Date(b.estimated_arrival_date).getTime()) * direction;
        default:
          return 0;
      }
    });
  }, [results, sortField, sortDirection]);

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatMonthlyConsumption = (consumption: number) => {
    return consumption.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Enhanced Forecast Results
          <span className="text-sm font-normal text-gray-500">
            ({results.length} items analyzed)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHeader
                  field="item_code"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Item Code
                </SortableTableHeader>
                <SortableTableHeader
                  field="description"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Description
                </SortableTableHeader>
                <SortableTableHeader
                  field="monthly_consumption"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Monthly Consumption
                </SortableTableHeader>
                <SortableTableHeader
                  field="current_stock"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Current Stock
                </SortableTableHeader>
                <SortableTableHeader
                  field="incoming_stock_total"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Incoming Stock
                </SortableTableHeader>
                <SortableTableHeader
                  field="predicted_quantity"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Recommended Order Qty
                </SortableTableHeader>
                <SortableTableHeader
                  field="stock_status"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Stock Status
                </SortableTableHeader>
                <SortableTableHeader
                  field="effective_days_until_stockout"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Effective Days
                </SortableTableHeader>
                <SortableTableHeader
                  field="confidence_score"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Confidence
                </SortableTableHeader>
                <TableHead className="text-center">Trend</TableHead>
                <SortableTableHeader
                  field="recommended_order_date"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  Order Date
                </SortableTableHeader>
                <SortableTableHeader
                  field="estimated_arrival_date"
                  currentSortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                >
                  ETA Date
                </SortableTableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.map((result) => {
                // Enhanced debugging for each row render
                console.log(`[ForecastResultsTable] Rendering row for ${result.item_code}:`, {
                  incoming_stock_total: result.incoming_stock_total,
                  incoming_stock_items_length: result.incoming_stock_items?.length || 0
                });

                return (
                  <TableRow key={result.item_code}>
                    <TableCell className="font-mono font-medium text-center">
                      {result.item_code}
                    </TableCell>
                    <TableCell className="min-w-[250px] whitespace-normal">
                      {result.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-700">
                          {formatMonthlyConsumption(result.monthly_consumption)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        {result.current_stock.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getIncomingStockBadge(
                        result.incoming_stock_total || 0, 
                        result.incoming_stock_items || [], 
                        formatOrderDate
                      )}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <div className="flex items-center justify-center gap-1">
                        {result.predicted_quantity.toLocaleString()}
                        {(result.incoming_stock_total || 0) > 0 && (
                          <span className="text-xs text-green-600" title="Calculation includes incoming stock">
                            ✓
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getStockStatusBadge(result.stock_status, result.effective_days_until_stockout)}
                        {result.effective_days_until_stockout !== result.days_until_stockout && (
                          <div title="Adjusted for incoming stock">
                            <AlertTriangle className="h-3 w-3 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant={result.effective_days_until_stockout <= 30 ? "destructive" : "secondary"}>
                          {result.effective_days_until_stockout}d
                        </Badge>
                        {result.effective_days_until_stockout !== result.days_until_stockout && (
                          <span className="text-xs text-gray-500">
                            was {result.days_until_stockout}d
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getConfidenceBadge(result.confidence_score)}
                    </TableCell>
                    <TableCell className="text-center">
                      <ForecastTrendIcon trend={result.trend} />
                    </TableCell>
                    <TableCell className="text-center">
                      {formatOrderDate(result.recommended_order_date)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Truck className="h-4 w-4 text-gray-400" />
                        {formatOrderDate(result.estimated_arrival_date)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastResultsTable;
