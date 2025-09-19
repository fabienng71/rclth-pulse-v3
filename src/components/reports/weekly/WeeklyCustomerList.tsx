import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useWeeklyCustomerList } from '@/hooks/useWeeklyCustomerList';

interface WeeklyCustomerListProps {
  year: number;
  week: number;
  selectedSalesperson: string;
  includeCreditMemo: boolean;
  includeServices: boolean;
}

export const WeeklyCustomerList: React.FC<WeeklyCustomerListProps> = ({
  year,
  week,
  selectedSalesperson,
  includeCreditMemo,
  includeServices,
}) => {
  const { data: customers, isLoading, error } = useWeeklyCustomerList(
    year, 
    week, 
    selectedSalesperson, 
    includeCreditMemo,
    includeServices
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'turnover' | 'margin_percent' | 'customer_name'>('turnover');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getMarginBadgeColor = (marginPercent: number) => {
    if (marginPercent >= 20) return 'bg-green-100 text-green-800 border-green-200';
    if (marginPercent >= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (marginPercent >= 5) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredAndSortedCustomers = useMemo(() => {
    if (!customers) return [];

    // Filter by search term
    const filtered = customers.filter(customer =>
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.search_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by selected field and direction
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case 'turnover':
          aValue = a.weekly_turnover;
          bValue = b.weekly_turnover;
          break;
        case 'margin_percent':
          aValue = a.weekly_margin_percent;
          bValue = b.weekly_margin_percent;
          break;
        case 'customer_name':
          aValue = a.customer_name.toLowerCase();
          bValue = b.customer_name.toLowerCase();
          break;
        default:
          aValue = a.weekly_turnover;
          bValue = b.weekly_turnover;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      const numA = aValue as number;
      const numB = bValue as number;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return filtered;
  }, [customers, searchTerm, sortField, sortDirection]);

  const handleSort = (field: 'turnover' | 'margin_percent' | 'customer_name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'customer_name' ? 'asc' : 'desc');
    }
  };

  const getSortIcon = (field: 'turnover' | 'margin_percent' | 'customer_name') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <TrendingUp className="h-3 w-3 ml-1" /> : 
      <TrendingDown className="h-3 w-3 ml-1" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Weekly Customer Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading customer data...</p>
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
            Weekly Customer Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading customer data: {error.message}
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
          Weekly Customer Performance ({filteredAndSortedCustomers.length} customers)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Customer Table */}
        {filteredAndSortedCustomers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No customers found for the selected criteria.</p>
            {searchTerm && (
              <p className="text-xs mt-2">Try adjusting your search term.</p>
            )}
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('customer_name')}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('customer_name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('turnover')}
                  >
                    <div className="flex items-center justify-end">
                      Weekly Turnover
                      {getSortIcon('turnover')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Margin Amount</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('margin_percent')}
                  >
                    <div className="flex items-center justify-end">
                      Margin %
                      {getSortIcon('margin_percent')}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCustomers.map((customer, index) => (
                  <TableRow key={customer.customer_code} className={index < 3 ? 'bg-muted/20' : ''}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {customer.search_name || customer.customer_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer.customer_code}
                        </div>
                        {index < 3 && (
                          <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                            Top {index + 1}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(customer.weekly_turnover)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(customer.weekly_margin_amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={getMarginBadgeColor(customer.weekly_margin_percent)}>
                        {formatPercentage(customer.weekly_margin_percent)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {customer.transaction_count}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary Statistics */}
        {filteredAndSortedCustomers.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Turnover:</span>
                <div className="font-medium">
                  {formatCurrency(filteredAndSortedCustomers.reduce((sum, c) => sum + c.weekly_turnover, 0))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Margin:</span>
                <div className="font-medium">
                  {formatCurrency(filteredAndSortedCustomers.reduce((sum, c) => sum + c.weekly_margin_amount, 0))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Margin %:</span>
                <div className="font-medium">
                  {formatPercentage(
                    filteredAndSortedCustomers.length > 0 
                      ? filteredAndSortedCustomers.reduce((sum, c) => sum + c.weekly_margin_percent, 0) / filteredAndSortedCustomers.length
                      : 0
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Total Transactions:</span>
                <div className="font-medium">
                  {filteredAndSortedCustomers.reduce((sum, c) => sum + c.transaction_count, 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};