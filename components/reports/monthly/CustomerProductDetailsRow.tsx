import React from 'react';
import { TableCell, TableRow, Table, TableBody, TableHead, TableHeader } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, Info } from 'lucide-react';
import { useCustomerProducts } from '@/hooks/useCustomerProducts';
import { FinancialData, PercentageData } from '@/components/permissions/PermissionGate';
import { cn } from '@/lib/utils';

interface CustomerProductDetailsRowProps {
  customerCode: string;
  searchName: string;
  year: number;
  month: number;
  selectedSalesperson: string;
  includeCreditMemos: boolean;
  colSpan: number;
}

export const CustomerProductDetailsRow: React.FC<CustomerProductDetailsRowProps> = ({
  customerCode,
  searchName,
  year,
  month,
  selectedSalesperson,
  includeCreditMemos,
  colSpan,
}) => {
  const { data, isLoading, error, isFetching } = useCustomerProducts({
    year,
    month,
    customerCode,
    selectedSalesperson,
    includeCreditMemos,
    enabled: true, // Always enabled when this component is rendered (expansion is controlled by parent)
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatQuantity = (quantity: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(quantity);
  };

  const getMarginColorClass = (marginPercent: number): string => {
    if (marginPercent >= 20) return "text-green-600";
    if (marginPercent >= 10) return "text-yellow-600";
    return "text-red-600";
  };

  // Calculate totals
  const totals = data.reduce((acc, product) => ({
    quantity: acc.quantity + product.quantity,
    amount: acc.amount + product.amount,
    total_cost: acc.total_cost + product.total_cost,
    margin_amount: acc.margin_amount + product.margin_amount,
    transaction_count: acc.transaction_count + product.transaction_count,
  }), {
    quantity: 0,
    amount: 0,
    total_cost: 0,
    margin_amount: 0,
    transaction_count: 0,
  });

  const overallMarginPercent = totals.amount > 0 ? (totals.margin_amount / totals.amount) * 100 : 0;

  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="p-0 bg-muted/20">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">
              Product Details - {searchName}
            </h4>
            <Badge variant="outline" className="text-xs">
              {includeCreditMemos ? 'Net Values' : 'Gross Values'}
            </Badge>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Loading product details...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Failed to load product details: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!isLoading && !error && data.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No product transactions found for this customer in the selected period.
              </AlertDescription>
            </Alert>
          )}

          {/* Product Details Table */}
          {!isLoading && !error && data.length > 0 && (
            <div className="space-y-3">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium">Total Products</div>
                  <div className="text-lg font-semibold text-blue-800">{data.length}</div>
                  <div className="text-xs text-blue-600">{totals.transaction_count} transactions</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-xs text-purple-600 font-medium">Total Quantity</div>
                  <div className="text-lg font-semibold text-purple-800">
                    {formatQuantity(totals.quantity)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium">Total Revenue</div>
                  <div className="text-lg font-semibold text-green-800">
                    <FinancialData 
                      amount={totals.amount}
                      permission="view_turnover_amounts"
                      showCurrency={false}
                    />
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-xs text-orange-600 font-medium">Overall Margin</div>
                  <div className="text-lg font-semibold text-orange-800">
                    <PercentageData 
                      percentage={overallMarginPercent}
                      permission="view_margins"
                    />
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-md border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center w-[100px]">Quantity</TableHead>
                      <TableHead className="text-center w-[120px]">Amount</TableHead>
                      <TableHead className="text-center w-[100px]">Margin %</TableHead>
                      <TableHead className="text-center w-[80px]">Txns</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((product, index) => (
                      <TableRow key={`${product.item_code}-${index}`} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs">
                          {product.item_code || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={product.item_description}>
                            {product.item_description}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {formatQuantity(product.quantity)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          <FinancialData 
                            amount={product.amount}
                            permission="view_turnover_amounts"
                            showCurrency={false}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "font-medium text-sm",
                            getMarginColorClass(product.margin_percent)
                          )}>
                            <PercentageData 
                              percentage={product.margin_percent}
                              permission="view_margins"
                            />
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {product.transaction_count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-muted/30 rounded-lg p-3">
                  <h5 className="font-medium mb-2">Performance Metrics</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Average Margin %:</span>
                      <span className={getMarginColorClass(overallMarginPercent)}>
                        <PercentageData 
                          percentage={overallMarginPercent}
                          permission="view_margins"
                        />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products with High Margin (≥20%):</span>
                      <span className="text-green-600">
                        {data.filter(p => p.margin_percent >= 20).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products with Low Margin (&lt;10%):</span>
                      <span className="text-red-600">
                        {data.filter(p => p.margin_percent < 10).length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <h5 className="font-medium mb-2">Financial Summary</h5>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span>
                        <FinancialData 
                          amount={totals.total_cost}
                          permission="view_costs"
                          showCurrency={false}
                        />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Margin:</span>
                      <span>
                        <FinancialData 
                          amount={totals.margin_amount}
                          permission="view_margins"
                          showCurrency={false}
                        />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Transaction Value:</span>
                      <span>
                        <FinancialData 
                          amount={totals.transaction_count > 0 ? totals.amount / totals.transaction_count : 0}
                          permission="view_turnover_amounts"
                          showCurrency={false}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};