
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';
import { useWeeklyTopCustomers } from '@/hooks/useWeeklyTopCustomers';

interface WeeklyTopCustomersTableProps {
  year: number;
  week: number;
  selectedSalesperson: string;
  includeCreditMemo: boolean;
  includeServices: boolean;
}

export const WeeklyTopCustomersTable: React.FC<WeeklyTopCustomersTableProps> = ({
  year,
  week,
  selectedSalesperson,
  includeCreditMemo,
  includeServices,
}) => {
  const { data: customersData, isLoading, error } = useWeeklyTopCustomers(year, week, selectedSalesperson, includeCreditMemo, includeServices);

  const { currentYearCustomers, previousYearCustomers } = useMemo(() => {
    if (!customersData) {
      return { currentYearCustomers: [], previousYearCustomers: [] };
    }

    const current = customersData.filter(c => c.period_type === 'current').slice(0, 5);
    const previous = customersData.filter(c => c.period_type === 'previous').slice(0, 5);
    
    return { currentYearCustomers: current, previousYearCustomers: previous };
  }, [customersData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 5 Customers This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading top customers...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 5 Customers This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading top customers: {error.message}
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
          Top 5 Customers - Week {week}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Year */}
          <div>
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">{year} (Current)</h4>
            {currentYearCustomers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No customers found for this week.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Turnover</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentYearCustomers.map((customer) => (
                    <TableRow key={customer.customer_code}>
                      <TableCell className="font-medium">{customer.rank_position}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.search_name}</div>
                          <div className="text-xs text-muted-foreground">{customer.customer_code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.turnover)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Previous Year */}
          <div>
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground">{year - 1} (Previous)</h4>
            {previousYearCustomers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No customers found for this week.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Turnover</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previousYearCustomers.map((customer) => (
                    <TableRow key={customer.customer_code}>
                      <TableCell className="font-medium">{customer.rank_position}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.search_name}</div>
                          <div className="text-xs text-muted-foreground">{customer.customer_code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.turnover)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
