
import React from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { MonthlySummary } from '@/hooks/useNewCustomersData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MonthlyNewCustomersSummaryProps {
  summary: MonthlySummary[];
  isLoading: boolean;
}

export const MonthlyNewCustomersSummary: React.FC<MonthlyNewCustomersSummaryProps> = ({
  summary,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex items-center justify-center p-4">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading summary data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (summary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex flex-col items-center justify-center p-4">
            <p className="text-muted-foreground">No data available for the selected time period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">New Customers</TableHead>
              <TableHead className="text-right">Cumulative Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.map((item) => (
              <TableRow key={item.year_month}>
                <TableCell>
                  {format(parseISO(`${item.year_month}-01`), 'MMMM yyyy')}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.new_customer_count}
                </TableCell>
                <TableCell className="text-right">
                  {item.cumulative_customer_count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right">
                {summary.reduce((sum, item) => sum + Number(item.new_customer_count), 0)}
              </TableCell>
              <TableCell className="text-right">
                {summary.length > 0 
                  ? summary[summary.length - 1].cumulative_customer_count 
                  : 0
                }
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
};
