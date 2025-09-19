
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, Users } from 'lucide-react';
import { useWeeklyProductData } from '@/hooks/useWeeklyProductData';
import { formatCurrency } from '@/lib/utils';

interface WeeklyDataDisplayProps {
  salespersonCode?: string;
}

export const WeeklyDataDisplay: React.FC<WeeklyDataDisplayProps> = ({ salespersonCode }) => {
  const { topProductsByQuantity, topProductsByTurnover, newCustomers, isLoading, error } = useWeeklyProductData(salespersonCode);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Error loading weekly data: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading for top products row */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-muted-foreground">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-4">
                  Loading data...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Loading for new customers card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-4">
              Loading customer data...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Products Row - 2 columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products by Quantity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Top Products (Qty)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProductsByQuantity.length > 0 ? (
                topProductsByQuantity.map((product, index) => (
                  <div key={product.item_code} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.description || product.item_code}
                      </p>
                      <p className="text-xs text-gray-500">{product.item_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {Number(product.total_quantity).toLocaleString()}
                      </Badge>
                      <span className="text-xs font-medium text-green-600">
                        THB {formatCurrency(Number(product.total_turnover))}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products by Turnover */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Products (THB)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProductsByTurnover.length > 0 ? (
                topProductsByTurnover.map((product, index) => (
                  <div key={product.item_code} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.description || product.item_code}
                      </p>
                      <p className="text-xs text-gray-500">{product.item_code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-green-600">
                        THB {formatCurrency(Number(product.total_turnover))}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Number(product.margin_percent).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Customers Card - Full width below */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            New Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {newCustomers.length > 0 ? (
              newCustomers.map((customer, index) => (
                <div key={customer.customer_code} className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {customer.search_name || customer.customer_name}
                    </p>
                    <p className="text-xs text-gray-500">{customer.customer_code}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {new Date(customer.first_transaction_date).toLocaleDateString('th-TH', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No new customers this week</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
