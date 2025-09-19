import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CustomerInsight } from '@/hooks/useEnhancedWeeklyData';
import { TierBadge } from './TierBadge';

interface CustomerTrendsTableProps {
  customers: CustomerInsight[];
  title: string;
  emoji: string;
  maxRows?: number;
  formatCurrency: (amount: number) => string;
  formatPercentage: (percentage: number) => string;
}

export const CustomerTrendsTable: React.FC<CustomerTrendsTableProps> = ({
  customers,
  title,
  emoji,
  maxRows = 5,
  formatCurrency,
  formatPercentage
}) => {
  if (customers.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold mb-2 text-green-700">{emoji} {title} (Top {maxRows})</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Weekly Sales</TableHead>
            <TableHead className="text-right">YoY Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.slice(0, maxRows).map((customer) => (
            <TableRow key={customer.customer_code}>
              <TableCell>
                <div>
                  <div className="font-medium">{customer.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{customer.customer_code}</div>
                </div>
              </TableCell>
              <TableCell>
                <TierBadge tier={customer.tier_classification} />
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(customer.weekly_turnover)}
              </TableCell>
              <TableCell className="text-right">
                <span className={customer.yoy_growth_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercentage(customer.yoy_growth_percent)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};