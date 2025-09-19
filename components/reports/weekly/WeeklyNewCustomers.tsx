import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { useNewCustomersData } from '@/hooks/useNewCustomersData';
import { WeeklySummary } from '@/hooks/useWeeklyData';
import { isWithinInterval } from 'date-fns';

interface WeeklyNewCustomersProps {
  summary: WeeklySummary | null;
}

export const WeeklyNewCustomers: React.FC<WeeklyNewCustomersProps> = ({ summary }) => {
  // Get all new customers data with a broader range to ensure we capture the week's data
  const { customers, isLoading } = useNewCustomersData(12); // Get 12 months of data

  // Filter and deduplicate customers for the selected week
  const weeklyNewCustomers = useMemo(() => {
    if (!summary || !customers) return [];
    
    const filteredCustomers = customers.filter(customer => {
      if (!customer.first_transaction_date) return false;
      const transactionDate = new Date(customer.first_transaction_date);
      return isWithinInterval(transactionDate, {
        start: summary.week_start,
        end: summary.week_end
      });
    });

    // Deduplicate by customer_code - keep only the first occurrence
    const uniqueCustomers = filteredCustomers.reduce((acc, customer) => {
      if (!acc.find(c => c.customer_code === customer.customer_code)) {
        acc.push(customer);
      }
      return acc;
    }, []);

    return uniqueCustomers;
  }, [customers, summary]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            New Customers This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading new customers...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          New Customers This Week ({weeklyNewCustomers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {weeklyNewCustomers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No new customers found for this week.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Salesperson</TableHead>
                <TableHead>First Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyNewCustomers.map((customer) => (
                <TableRow key={customer.customer_code}>
                  <TableCell className="font-medium">{customer.customer_code}</TableCell>
                  <TableCell>{customer.customer_name}</TableCell>
                  <TableCell>{customer.salesperson_code || '-'}</TableCell>
                  <TableCell>
                    {customer.first_transaction_date 
                      ? new Date(customer.first_transaction_date).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
