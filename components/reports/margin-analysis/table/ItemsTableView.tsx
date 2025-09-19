import React from 'react';
import { Table, TableHeader, TableRow, TableBody, TableCell, TableHead } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { MarginTableHeader } from '../MarginTableHeader';
import { SortDirection, SortField } from '@/hooks/useMarginTableSort';
import { MarginItem } from '../types';

export interface SortableItemsTableViewProps {
  currentData: MarginItem[];
  getBarColor: (margin: number) => string;
  colors: {
    high: string;
    medium: string;
    low: string;
  };
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

export const ItemsTableView = ({ 
  currentData = [], // Provide default empty array to prevent 'map of undefined' error
  getBarColor, 
  colors, 
  sortField,
  sortDirection,
  handleSort
}: SortableItemsTableViewProps) => {
  // Safely handle data - ensure it's always an array even if null/undefined is passed
  const safeData = Array.isArray(currentData) ? currentData : [];
  
  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">Rank</TableHead>
            <MarginTableHeader
              field="item_code"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Item Code
            </MarginTableHeader>
            <MarginTableHeader
              field="description"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Description
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
          {safeData.map((item: MarginItem, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-center">{index + 1}</TableCell>
              <TableCell>{item.item_code}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell className="text-right">{formatNumber(item.total_quantity)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.total_sales)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.total_cost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.margin)}</TableCell>
              <TableCell className={`text-right font-medium ${getBarColor(item.margin_percent) === colors.high ? 'text-green-600' : getBarColor(item.margin_percent) === colors.medium ? 'text-yellow-500' : 'text-red-500'}`}>
                {item.margin_percent.toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
