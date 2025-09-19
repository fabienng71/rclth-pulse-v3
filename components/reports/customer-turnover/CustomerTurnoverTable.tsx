
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerMonthlyTurnover } from '@/hooks/useCustomerTurnoverData';
import { CustomerTableSkeleton } from './components/CustomerTableSkeleton';
import { CustomerTurnoverTableHeader } from './components/CustomerTurnoverTableHeader';
import { CustomerRow } from './components/CustomerRow';
import { TotalsRow } from './components/TotalsRow';
import { useCustomerTurnoverTable } from './hooks/useCustomerTurnoverTable';
import { ExportButton } from './ExportButton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CustomerTurnoverTableProps {
  data: CustomerMonthlyTurnover[];
  isLoading: boolean;
  fromDate?: Date;
  toDate?: Date;
  includeCredits?: boolean;
}

export const CustomerTurnoverTable: React.FC<CustomerTurnoverTableProps> = ({
  data,
  isLoading,
  fromDate,
  toDate,
  includeCredits = true
}) => {
  const [showZeroTurnover, setShowZeroTurnover] = useState(false);

  const {
    uniqueCustomers,
    uniqueMonths,
    dataMap,
    customerTotals,
    monthTotals,
    grandTotal,
    sortedCustomers,
    hiddenCustomersCount,
    sortField,
    sortDirection,
    handleSort
  } = useCustomerTurnoverTable(data, fromDate, toDate, includeCredits, showZeroTurnover);
  
  const showLargeDatasetWarning = uniqueCustomers.length > 50;
  const veryLargeDataset = uniqueCustomers.length > 100;
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <CustomerTableSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <div className="text-center text-muted-foreground">
            <p>No turnover data available for the selected customers and date range.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0 pt-4 flex flex-row items-center">
        <CardTitle className="text-base">
          Customer Turnover by Month
          {!includeCredits && <span className="ml-2 text-sm text-muted-foreground">(Excluding Credit Memos)</span>}
        </CardTitle>
        <ExportButton 
          data={data} 
          uniqueCustomers={uniqueCustomers}
          uniqueMonths={uniqueMonths}
          dataMap={dataMap}
          customerTotals={customerTotals}
          monthTotals={monthTotals}
          grandTotal={grandTotal}
        />
      </CardHeader>
      <CardContent className="pt-6">
        {showLargeDatasetWarning && (
          <Alert variant={veryLargeDataset ? "destructive" : "warning"} className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{veryLargeDataset ? "Very Large Dataset" : "Large Dataset"}</AlertTitle>
            <AlertDescription>
              {veryLargeDataset 
                ? `You've selected ${uniqueCustomers.length} customers, which is very large. Some data may not display correctly. 
                   We recommend selecting fewer customers (max 75) at a time for the most accurate results.`
                : `You've selected ${uniqueCustomers.length} customers. For better performance and accuracy, 
                   consider selecting fewer customers at a time.`}
            </AlertDescription>
          </Alert>
        )}
        
        {data.length > 0 && uniqueCustomers.length === 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Data Processing Error</AlertTitle>
            <AlertDescription>
              There was a problem processing the customer data. Try selecting fewer customers or a smaller date range.
            </AlertDescription>
          </Alert>
        )}

        {/* Add option to show/hide zero turnover customers */}
        {hiddenCustomersCount > 0 && (
          <div className="flex items-center justify-between mb-4 p-2 bg-muted/50 rounded-md">
            <div className="flex items-center text-sm">
              <Info className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {hiddenCustomersCount} {hiddenCustomersCount === 1 ? 'customer' : 'customers'} with no turnover are hidden
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="show-zero-turnover" 
                checked={showZeroTurnover} 
                onCheckedChange={setShowZeroTurnover}
              />
              <Label htmlFor="show-zero-turnover">Show all customers</Label>
            </div>
          </div>
        )}
        
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <CustomerTurnoverTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              uniqueMonths={uniqueMonths}
            />
            <TableBody>
              {sortedCustomers.map(customer => (
                <CustomerRow
                  key={customer.code}
                  customer={customer}
                  monthData={dataMap[customer.code]}
                  uniqueMonths={uniqueMonths}
                  total={customerTotals[customer.code]}
                />
              ))}
              <TotalsRow
                monthTotals={monthTotals}
                uniqueMonths={uniqueMonths}
                grandTotal={grandTotal}
              />
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
