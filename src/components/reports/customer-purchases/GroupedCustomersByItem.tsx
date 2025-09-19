
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { extractSortedMonths } from '../monthly-data';
import { ItemCustomerData } from '@/hooks/useCustomerPurchases';

interface GroupedCustomersByItemProps {
  customerPurchases: ItemCustomerData[];
  selectedItems: string[];
  isLoading: boolean;
  showAmount: boolean;
}

export const GroupedCustomersByItem: React.FC<GroupedCustomersByItemProps> = ({
  customerPurchases,
  selectedItems,
  isLoading,
  showAmount
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemCode: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemCode)) {
      newOpenItems.delete(itemCode);
    } else {
      newOpenItems.add(itemCode);
    }
    setOpenItems(newOpenItems);
  };

  const allMonths = React.useMemo(() => {
    const allCustomers = customerPurchases.flatMap(item => item.customers);
    return extractSortedMonths(allCustomers.map(customer => ({ month_data: customer.month_data })));
  }, [customerPurchases]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Customer Purchases by Item {showAmount ? '(Amount)' : '(Quantity)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading customer data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Customer Purchases by Item {showAmount ? '(Amount)' : '(Quantity)'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customerPurchases.map((itemData) => (
          <Collapsible
            key={itemData.item_code}
            open={openItems.has(itemData.item_code)}
            onOpenChange={() => toggleItem(itemData.item_code)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto"
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="font-mono text-sm text-muted-foreground">
                      {itemData.item_code}
                    </div>
                    <div className="font-medium">
                      {itemData.item_description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">
                      {itemData.total_customers} customers
                    </div>
                    <div className="font-medium">
                      Total: {formatCurrency(showAmount ? itemData.total_amount : itemData.total_quantity)}
                    </div>
                  </div>
                  {openItems.has(itemData.item_code) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Code</TableHead>
                      <TableHead>Customer Name</TableHead>
                      {allMonths.map(month => (
                        <TableHead key={month} className="text-center">
                          {month}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Total</TableHead>
                      {showAmount && (
                        <>
                          <TableHead className="text-center">Margin %</TableHead>
                          <TableHead className="text-center">Last Price</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemData.customers.map((customer) => (
                      <TableRow key={customer.customer_code}>
                        <TableCell className="font-mono text-sm">
                          {customer.customer_code}
                        </TableCell>
                        <TableCell>
                          {customer.search_name || customer.customer_name || '-'}
                        </TableCell>
                        {allMonths.map(month => (
                          <TableCell key={month} className="text-center">
                            {customer.month_data[month] 
                              ? formatCurrency(showAmount 
                                  ? customer.month_data[month].amount 
                                  : customer.month_data[month].quantity)
                              : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-bold text-green-600">
                          {formatCurrency(showAmount ? customer.total_amount : customer.total_quantity)}
                        </TableCell>
                        {showAmount && (
                          <>
                            <TableCell className={`text-center font-bold ${
                              customer.margin_percent && customer.margin_percent < 25 
                                ? 'text-red-500' 
                                : 'text-green-600'
                            }`}>
                              {customer.margin_percent !== null 
                                ? `${formatCurrency(customer.margin_percent)}%` 
                                : '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {customer.last_unit_price !== null 
                                ? `฿${formatCurrency(customer.last_unit_price)}` 
                                : '-'}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {customerPurchases.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No customer purchase data available for the selected items.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
