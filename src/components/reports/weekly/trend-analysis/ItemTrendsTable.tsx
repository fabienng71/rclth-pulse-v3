import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ItemInsight } from '@/hooks/useEnhancedWeeklyData';

interface ItemTrendsTableProps {
  items: ItemInsight[];
  title: string;
  emoji: string;
  maxRows?: number;
  formatCurrency: (amount: number) => string;
  formatPercentage: (percentage: number) => string;
}

export const ItemTrendsTable: React.FC<ItemTrendsTableProps> = ({
  items,
  title,
  emoji,
  maxRows = 5,
  formatCurrency,
  formatPercentage
}) => {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold mb-2 text-blue-700">{emoji} {title} (Top {maxRows})</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Weekly Sales</TableHead>
            <TableHead className="text-right">Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.slice(0, maxRows).map((item, index) => (
            <TableRow key={`${item.item_code}-${index}`}>
              <TableCell>
                <div>
                  <div className="font-medium text-sm">{item.item_description}</div>
                  <div className="text-xs text-muted-foreground">{item.item_code}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {item.category || 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.weekly_sales || 0)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  {(item.growth_rate || 0) >= 0 ? (
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={(item.growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatPercentage(item.growth_rate || 0)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};