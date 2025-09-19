
import React from 'react';
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { MarginCategory } from '../types';
import { MarginTableHeader } from '../MarginTableHeader';
import { SortDirection, SortField } from '@/hooks/useMarginTableSort';

export interface SortableCategoriesTableViewProps {
  currentData: MarginCategory[];
  getBarColor: (margin: number) => string;
  colors: {
    high: string;
    medium: string;
    mediumLow: string;
    low: string;
  };
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

export const CategoriesTableView = ({ 
  currentData, 
  getBarColor, 
  colors,
  sortField = 'margin_percent',
  sortDirection = 'desc',
  onSort = () => {}
}: SortableCategoriesTableViewProps) => {
  // Safely handle data - ensure it's always an array even if null/undefined is passed
  const safeData = Array.isArray(currentData) ? currentData.filter(Boolean) : [];
  
  // Get color class based on margin percentage
  const getMarginColorClass = (marginPercent: number) => {
    if (marginPercent >= 28) return 'text-green-600';
    if (marginPercent >= 20) return 'text-amber-500';
    if (marginPercent >= 15) return 'text-orange-600';
    return 'text-red-500';
  };
  
  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No category data available.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">Rank</TableHead>
            <MarginTableHeader
              field="posting_group"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Category
            </MarginTableHeader>
            <MarginTableHeader
              field="total_quantity"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Quantity
            </MarginTableHeader>
            <MarginTableHeader
              field="total_sales"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Sales
            </MarginTableHeader>
            <MarginTableHeader
              field="total_cost"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Cost
            </MarginTableHeader>
            <MarginTableHeader
              field="margin"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Margin
            </MarginTableHeader>
            <MarginTableHeader
              field="margin_percent"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Margin %
            </MarginTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.map((category, index) => {
            // Ensure all required fields exist with fallbacks
            const postingGroup = category?.posting_group || 'Unknown';
            const totalQuantity = category?.total_quantity || 0;
            const totalSales = category?.total_sales || 0;
            const totalCost = category?.total_cost || 0;
            const margin = category?.margin || 0;
            const marginPercent = category?.margin_percent || 0;
            
            return (
              <TableRow key={`${postingGroup}-${index}`}>
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell>{postingGroup}</TableCell>
                <TableCell className="text-right">{formatNumber(totalQuantity)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalSales)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCost)}</TableCell>
                <TableCell className="text-right">{formatCurrency(margin)}</TableCell>
                <TableCell className={`text-right font-medium ${getMarginColorClass(marginPercent)}`}>
                  {marginPercent.toFixed(2)}%
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
