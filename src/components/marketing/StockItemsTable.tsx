
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockItem } from '@/hooks/useStockData';
import { StockStatusBadge } from './StockStatusBadge';
import { LastMonthConsumptionCell } from './LastMonthConsumptionCell';
import { StockCategorySummary } from './StockCategorySummary';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { useSortableTable } from '@/hooks/useSortableTable';

interface StockItemsTableProps {
  title: string;
  items: StockItem[];
  totalValue?: number;
  totalItems?: number;
  criticalItems?: number;
  hideSummary?: boolean;
}

type SortField = 'item_code' | 'description' | 'quantity' | 'last_month_consumption' | 'unit_price' | 'stock_value' | 'days_of_stock';

export function StockItemsTable({ 
  items, 
  title, 
  totalValue = 0, 
  totalItems = 0, 
  criticalItems = 0,
  hideSummary = false
}: StockItemsTableProps) {
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('item_code');

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'item_code':
          return (a.item_code > b.item_code ? 1 : -1) * direction;
        case 'description':
          return ((a.description || '') > (b.description || '') ? 1 : -1) * direction;
        case 'quantity':
          return (a.adjusted_quantity - b.adjusted_quantity) * direction; // Use adjusted quantity for sorting
        case 'last_month_consumption':
          return (a.last_month_consumption - b.last_month_consumption) * direction;
        case 'unit_price':
          return ((a.unit_price || 0) - (b.unit_price || 0)) * direction;
        case 'stock_value':
          return (a.stock_value - b.stock_value) * direction;
        case 'days_of_stock':
          return (a.days_of_stock - b.days_of_stock) * direction;
        default:
          return 0;
      }
    });
  }, [items, sortField, sortDirection]);

  const getQuantityCellClass = (status: string, quantity: number) => {
    if (quantity === 0) return 'text-red-600 font-semibold';
    
    switch (status) {
      case 'critical':
        return 'text-red-600 font-semibold';
      case 'low':
        return 'text-yellow-600 font-medium';
      case 'normal':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined || value === 0) return '-';
    return value.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (title) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      );
    }
    return <div className="mb-4">{children}</div>;
  };

  return (
    <CardWrapper>
      {!hideSummary && (
        <StockCategorySummary 
          totalItems={totalItems}
          totalValue={totalValue}
          criticalItems={criticalItems}
        />
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeader
                field="item_code"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Item Code
              </SortableTableHeader>
              <SortableTableHeader
                field="description"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
              >
                Description
              </SortableTableHeader>
              <TableHead>Unit</TableHead>
              <SortableTableHeader
                field="quantity"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="center"
              >
                Quantity
              </SortableTableHeader>
              <SortableTableHeader
                field="last_month_consumption"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="center"
              >
                Last Month Consumption
              </SortableTableHeader>
              <SortableTableHeader
                field="unit_price"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="center"
              >
                Unit Price
              </SortableTableHeader>
              <SortableTableHeader
                field="stock_value"
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                align="right"
              >
                Stock Value
              </SortableTableHeader>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.item_code}>
                <TableCell className="font-medium">{item.item_code}</TableCell>
                <TableCell>{item.description || 'N/A'}</TableCell>
                <TableCell>{item.base_unit_code || 'N/A'}</TableCell>
                <TableCell className={`text-center ${getQuantityCellClass(item.stock_status, item.adjusted_quantity)}`}>
                  {formatNumber(item.adjusted_quantity)}
                </TableCell>
                <TableCell className="text-center">
                  <LastMonthConsumptionCell lastMonthConsumption={item.last_month_consumption} />
                </TableCell>
                <TableCell className="text-center">
                  {formatNumber(item.unit_price)}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(item.stock_value)}
                </TableCell>
                <TableCell>
                  <StockStatusBadge 
                    status={item.stock_status} 
                    daysOfStock={item.days_of_stock}
                  />
                </TableCell>
              </TableRow>
            ))}
            {sortedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardWrapper>
  );
}
