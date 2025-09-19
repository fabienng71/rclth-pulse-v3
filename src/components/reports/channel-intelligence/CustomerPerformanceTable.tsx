import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHeader, type SortDirection } from '@/components/ui/sortable-table-header';
import { formatCurrency } from '@/lib/utils';

interface CustomerPerformanceTableProps {
  data: any[];
  isLoading: boolean;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export const CustomerPerformanceTable: React.FC<CustomerPerformanceTableProps> = ({ 
  data, 
  isLoading, 
  limit, 
  onLimitChange 
}) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      const numA = Number(aVal) || 0;
      const numB = Number(bVal) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [data, sortKey, sortDirection]);

  const limitedData = sortedData.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Performance Analysis</CardTitle>
          <CardDescription>Loading customer performance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Customer Performance Analysis</CardTitle>
            <CardDescription>Customer basket performance vs channel averages</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={limit.toString()} onValueChange={(value) => onLimitChange(parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHeader 
                  sortKey="customer_name" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-left"
                >
                  Customer
                </SortableTableHeader>
                <SortableTableHeader 
                  sortKey="channel_code" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-center"
                >
                  Channel
                </SortableTableHeader>
                <SortableTableHeader 
                  sortKey="avg_basket_size_amount" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-center"
                >
                  Avg Basket Size
                </SortableTableHeader>
                <SortableTableHeader 
                  sortKey="avg_basket_margin_percent" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-center"
                >
                  Avg Margin %
                </SortableTableHeader>
                <SortableTableHeader 
                  sortKey="total_transactions" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-center"
                >
                  Transactions
                </SortableTableHeader>
                <SortableTableHeader 
                  sortKey="total_revenue" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-center"
                >
                  Revenue
                </SortableTableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {limitedData.map((customer) => (
                <TableRow key={`${customer.customer_no}_${customer.channel_code}`}>
                  <TableCell>
                    <div className="font-medium">{customer.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{customer.customer_no}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{customer.channel_code}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {formatCurrency(customer.avg_basket_size_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={customer.avg_basket_margin_percent > 20 ? 'default' : 'secondary'}>
                      {customer.avg_basket_margin_percent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{customer.total_transactions}</TableCell>
                  <TableCell className="text-center font-mono">
                    {formatCurrency(customer.total_revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};