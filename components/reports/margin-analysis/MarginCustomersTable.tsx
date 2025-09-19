
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useMarginTableSort } from '@/hooks/useMarginTableSort';
import { MarginTableHeader } from './MarginTableHeader';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MarginCustomersTableProps, MarginCustomer } from './types';

export const MarginCustomersTable = ({
  title,
  customers,
  isLoading,
  emptyMessage = "No customers to display."
}: MarginCustomersTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Safely filter the customers to handle null values
  const filteredCustomers = customers.filter((customer: MarginCustomer) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.customer_code && customer.customer_code.toLowerCase().includes(searchLower)) ||
      (customer.search_name && customer.search_name.toLowerCase().includes(searchLower)) ||
      (customer.customer_name && customer.customer_name.toLowerCase().includes(searchLower))
    );
  });
  
  const {
    sortedData,
    sortField,
    sortDirection,
    handleSort
  } = useMarginTableSort(filteredCustomers, 'margin_percent', 'desc');

  // Calculate dynamic height based on number of rows
  const tableHeight = Math.min(600, Math.max(300, (sortedData.length * 48) + 56));

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)]">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-slate-200 rounded w-full"></div>
            <div className="h-6 bg-slate-200 rounded w-full"></div>
            <div className="h-6 bg-slate-200 rounded w-full"></div>
            <div className="h-6 bg-slate-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="relative w-48">
            <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        {sortedData.length > 0 ? (
          <div className="rounded-md overflow-auto border-t" style={{ height: `${tableHeight}px` }}>
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
                    Customer Code
                  </MarginTableHeader>
                  <MarginTableHeader 
                    field="search_name" 
                    currentSortField={sortField} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                  >
                    Customer Name
                  </MarginTableHeader>
                  <MarginTableHeader 
                    field="total_quantity" 
                    currentSortField={sortField} 
                    sortDirection={sortDirection} 
                    onSort={handleSort}
                    align="right"
                  >
                    Qty
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
                    %
                  </MarginTableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((customer: MarginCustomer, index) => {
                  const marginClass = customer.margin_percent >= 28 
                    ? "text-green-600 font-bold" 
                    : customer.margin_percent >= 20 ? "text-amber-500 font-bold" 
                    : customer.margin_percent >= 15 ? "text-orange-600 font-bold" 
                    : "text-red-500 font-bold";
                  
                  return (
                    <TableRow key={`${customer.customer_code}-${index}`} className="hover:bg-muted/60">
                      <TableCell className="font-medium text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{customer.customer_code}</TableCell>
                      <TableCell>{customer.search_name || customer.customer_name || '-'}</TableCell>
                      <TableCell className="text-right">{formatNumber(customer.total_quantity)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.total_sales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(customer.margin)}</TableCell>
                      <TableCell className={`text-right ${marginClass}`}>
                        {customer.margin_percent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full border-t">
            <p className="text-muted-foreground text-center py-8">
              {searchTerm ? "No customers match your search." : emptyMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
