
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useClearanceCustomerData, type ClearanceCustomerData } from '@/hooks/useClearanceCustomerData';
import { Skeleton } from '@/components/ui/skeleton';

interface ClearanceRowExpansionProps {
  itemCode: string;
}

export function ClearanceRowExpansion({ itemCode }: ClearanceRowExpansionProps) {
  const { data: customers, isLoading, error } = useClearanceCustomerData(itemCode, true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatQuantity = (quantity: number) => {
    return Math.floor(quantity).toLocaleString('en-US');
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-destructive">Error loading customer data</p>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">No customers found for this item in the last 6 months</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/30">
      <h4 className="text-sm font-medium mb-3">Recent Customers (Last 6 Months)</h4>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Customer Code</TableHead>
              <TableHead className="text-xs">Customer Name</TableHead>
              <TableHead className="text-xs text-right">Total Qty</TableHead>
              <TableHead className="text-xs">Last Purchase</TableHead>
              <TableHead className="text-xs text-center">Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customer_code} className="text-xs">
                <TableCell className="font-mono text-xs">
                  {customer.customer_code}
                </TableCell>
                <TableCell className="text-xs">
                  <div>
                    <div className="font-medium">{customer.customer_name}</div>
                    {customer.search_name && customer.search_name !== customer.customer_name && (
                      <div className="text-muted-foreground text-xs">({customer.search_name})</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs">
                  {formatQuantity(customer.total_quantity)}
                </TableCell>
                <TableCell className="text-xs">
                  {formatDate(customer.last_purchase_date)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-xs">
                    {customer.purchase_frequency}x
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Showing top {customers.length} customers by most recent purchase
      </p>
    </div>
  );
}
