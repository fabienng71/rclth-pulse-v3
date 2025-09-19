
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerWithAnalytics } from '@/hooks/useCustomersWithAnalytics';
import { formatCurrency } from '@/lib/utils';

interface CustomersStatsProps {
  customers: CustomerWithAnalytics[];
}

export const CustomersStats: React.FC<CustomersStatsProps> = ({ customers }) => {
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalTurnover = customers.reduce((sum, customer) => sum + customer.total_turnover, 0);
    const activeCustomers = customers.filter(customer => customer.total_turnover > 0).length;
    const averageTurnover = totalCustomers > 0 ? totalTurnover / totalCustomers : 0;
    const highValueCustomers = customers.filter(customer => customer.total_turnover > 100000).length;
    
    return {
      totalCustomers,
      totalTurnover,
      activeCustomers,
      averageTurnover,
      highValueCustomers
    };
  }, [customers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-600">{stats.activeCustomers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalCustomers > 0 ? ((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1) : 0}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Turnover</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">฿{formatCurrency(stats.totalTurnover)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Turnover</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">฿{formatCurrency(stats.averageTurnover)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">High Value</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-600">{stats.highValueCustomers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            &gt;฿100K turnover
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
