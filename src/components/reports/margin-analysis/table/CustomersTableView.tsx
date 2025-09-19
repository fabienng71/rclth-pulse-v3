
import React from 'react';
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { MarginCustomer } from '../types';
import { MarginTableHeader } from '../MarginTableHeader';
import { SortDirection, SortField } from '@/hooks/useMarginTableSort';

export interface SortableCustomersTableViewProps {
  currentData: MarginCustomer[];
  getBarColor: (margin: number) => string;
  colors: {
    high: string;
    medium: string;
    mediumLow: string;
    low: string;
  };
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

export const CustomersTableView = ({ 
  currentData, 
  getBarColor, 
  colors, 
  sortField,
  sortDirection,
  handleSort
}: SortableCustomersTableViewProps) => {
  // Safely handle data - ensure it's always an array and filter out invalid entries
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
        <p className="text-muted-foreground">No customer data available.</p>
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
              field="customer_code"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Customer
            </MarginTableHeader>
            <MarginTableHeader
              field="total_quantity"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="right"
            >
              Quantity
            </MarginTableHeader>
            <MarginTableHeader
              field="total_sales"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="right"
            >
              Sales
            </MarginTableHeader>
            <MarginTableHeader
              field="total_cost"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="right"
            >
              Cost
            </MarginTableHeader>
            <MarginTableHeader
              field="margin"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="right"
            >
              Margin
            </MarginTableHeader>
            <MarginTableHeader
              field="margin_percent"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="right"
            >
              Margin %
            </MarginTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.map((customer: MarginCustomer, index) => {
            // Ensure all required fields exist with fallbacks
            const customerCode = customer?.customer_code || 'Unknown';
            const customerName = customer?.search_name || customer?.customer_name || 'Unknown';
            const totalQuantity = customer?.total_quantity || 0;
            const totalSales = customer?.total_sales || 0;
            const totalCost = customer?.total_cost || 0;
            const margin = customer?.margin || 0;
            const marginPercent = customer?.margin_percent || 0;
            
            return (
              <TableRow key={`${customerCode}-${index}`}>
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell>
                  <div>{customerName}</div>
                  <div className="text-xs text-muted-foreground">{customerCode}</div>
                </TableCell>
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
