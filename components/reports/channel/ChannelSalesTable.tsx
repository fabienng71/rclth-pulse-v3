
import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableCellNumeric,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { useSortableTable } from '@/hooks/useSortableTable';
import { formatCurrency } from '@/lib/utils';
import { formatMonth } from '@/components/reports/monthly-data/formatUtil';
import { useNavigate } from 'react-router-dom';
import { SimpleChannelData } from '@/hooks/useSimpleChannelData';

interface ChannelSalesTableProps {
  data: SimpleChannelData[];
  months: string[];
  isLoading: boolean;
  error: Error | null;
}

const ChannelSalesTable = ({ data, months, isLoading, error }: ChannelSalesTableProps) => {
  type SortField = 'channel' | 'channel_name' | 'total' | 'percentage' | string;
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('total');
  
  const navigate = useNavigate();

  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;
    
    if (data) {
      data.forEach(channel => {
        months.forEach(month => {
          const sales = channel.months[month] || 0;
          totals[month] = (totals[month] || 0) + sales;
        });
        grandTotal += channel.total;
      });
    }
    
    return { monthlyTotals: totals, grandTotal };
  }, [data, months]);

  const sortedChannels = useMemo(() => {
    if (!data) return [];
    
    return [...data].sort((a, b) => {
      if (months.includes(sortField)) {
        const aValue = a.months[sortField] || 0;
        const bValue = b.months[sortField] || 0;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (sortField === 'total') {
        return sortDirection === 'asc' ? a.total - b.total : b.total - a.total;
      }

      if (sortField === 'percentage') {
        const grandTotal = columnTotals.grandTotal;
        const aPercentage = grandTotal > 0 ? (a.total / grandTotal * 100) : 0;
        const bPercentage = grandTotal > 0 ? (b.total / grandTotal * 100) : 0;
        return sortDirection === 'asc' ? aPercentage - bPercentage : bPercentage - aPercentage;
      }

      if (sortField === 'channel') {
        return sortDirection === 'asc' 
          ? a.channel.localeCompare(b.channel) 
          : b.channel.localeCompare(a.channel);
      }
      
      // Default to channel name
      const aName = a.channel_name?.toLowerCase() || a.channel.toLowerCase();
      const bName = b.channel_name?.toLowerCase() || b.channel.toLowerCase();
      return sortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });
  }, [data, sortField, sortDirection, months, columnTotals.grandTotal]);
  
  const onChannelClick = (channelCode: string) => {
    if (!channelCode) return;
    console.log(`Navigating to channel detail for code: ${channelCode}`);
    
    const params = new URLSearchParams();
    if (months && months.length > 0) {
      params.set("from", months[0] + "-01");
      params.set("to", months[months.length - 1] + "-28");
    }
    navigate(`/reports/channels/${encodeURIComponent(channelCode)}?${params.toString()}`);
  };

  if (isLoading) {
    return <Card className="p-6">Loading channel sales data...</Card>;
  }
  
  if (error) {
    return <Card className="p-6 text-red-600">Error: {error.message}</Card>;
  }
  
  if (!data || data.length === 0) {
    return <Card className="p-6">No channel sales data available for the selected period.</Card>;
  }

  return (
    <Card className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHeader
              field="channel"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={(field) => handleSort(field as SortField)}
            >
              Channel Code
            </SortableTableHeader>
            
            <SortableTableHeader
              field="channel_name"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={(field) => handleSort(field as SortField)}
            >
              Channel Name
            </SortableTableHeader>
            
            {months.map(month => (
              <SortableTableHeader
                key={month}
                field={month}
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={(field) => handleSort(field as SortField)}
                align="right"
              >
                {formatMonth(month)}
              </SortableTableHeader>
            ))}
            
            <SortableTableHeader
              field="total"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={(field) => handleSort(field as SortField)}
              align="right"
            >
              Total
            </SortableTableHeader>
            
            <SortableTableHeader
              field="percentage"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={(field) => handleSort(field as SortField)}
              align="center"
            >
              % of Total
            </SortableTableHeader>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {sortedChannels.map((channel) => (
            <TableRow key={channel.channel}>
              <TableCell>
                <span
                  className="text-blue-800 hover:underline cursor-pointer"
                  tabIndex={0}
                  role="button"
                  onClick={() => onChannelClick(channel.channel)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChannelClick(channel.channel) }}
                >
                  {channel.channel}
                </span>
              </TableCell>
              
              <TableCell>{channel.channel_name || channel.channel}</TableCell>
              
              {months.map(month => (
                <TableCellNumeric 
                  key={`${channel.channel}-${month}`}
                  value={channel.months[month] || 0}
                >
                  {formatCurrency(channel.months[month] || 0)}
                </TableCellNumeric>
              ))}
              
              <TableCellNumeric
                value={channel.total}
                className="font-medium"
              >
                {formatCurrency(channel.total)}
              </TableCellNumeric>
              
              <TableCell className="font-medium text-center">
                {columnTotals.grandTotal > 0 
                  ? `${((channel.total / columnTotals.grandTotal) * 100).toFixed(1)}%` 
                  : '0.0%'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        
        <TableFooter>
          <TableRow>
            <TableCell className="font-semibold">Total</TableCell>
            <TableCell></TableCell>
            
            {months.map(month => (
              <TableCellNumeric
                key={`total-${month}`}
                value={columnTotals.monthlyTotals[month] || 0}
                className="font-semibold"
              >
                {formatCurrency(columnTotals.monthlyTotals[month] || 0)}
              </TableCellNumeric>
            ))}
            
            <TableCellNumeric
              value={columnTotals.grandTotal}
              className="font-semibold"
            >
              {formatCurrency(columnTotals.grandTotal)}
            </TableCellNumeric>
            
            <TableCell className="font-semibold text-center">
              100.0%
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );
};

export default ChannelSalesTable;
