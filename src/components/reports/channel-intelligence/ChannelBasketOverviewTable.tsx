import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SortableTableHeader, type SortDirection } from '@/components/ui/sortable-table-header';
import { formatCurrency } from '@/lib/utils';

interface ChannelBasketOverviewTableProps {
  data: any[];
  isLoading: boolean;
  onChannelClick: (channelCode: string, channelName: string) => void;
}

export const ChannelBasketOverviewTable: React.FC<ChannelBasketOverviewTableProps> = ({ 
  data, 
  isLoading, 
  onChannelClick 
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Basket Overview</CardTitle>
          <CardDescription>Loading channel performance metrics...</CardDescription>
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
        <CardTitle>Channel Basket Overview</CardTitle>
        <CardDescription>Average basket size and performance by channel (Click channel to see typical basket)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHeader 
                  sortKey="channel_name" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-left"
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
                  sortKey="total_customers" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-center"
                >
                  Customers
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
                  Total Revenue
                </SortableTableHeader>
                <SortableTableHeader 
                  sortKey="avg_items_per_basket" 
                  currentSortKey={sortKey} 
                  currentSortDirection={sortDirection} 
                  onSort={handleSort}
                  className="text-center"
                >
                  Items/Basket
                </SortableTableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((channel) => (
                <TableRow 
                  key={channel.channel_code} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onChannelClick(channel.channel_code, channel.channel_name || channel.channel_code)}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{channel.channel_name || channel.channel_code}</div>
                      <div className="text-xs text-muted-foreground">{channel.channel_code}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {formatCurrency(channel.avg_basket_size_amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={channel.avg_basket_margin_percent > 20 ? 'default' : 'secondary'}>
                      {channel.avg_basket_margin_percent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{channel.total_customers.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{channel.total_transactions.toLocaleString()}</TableCell>
                  <TableCell className="text-center font-mono">
                    {formatCurrency(channel.total_revenue)}
                  </TableCell>
                  <TableCell className="text-center">{channel.avg_items_per_basket.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};