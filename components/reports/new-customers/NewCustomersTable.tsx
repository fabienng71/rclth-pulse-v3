
import React from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { NewCustomer } from '@/hooks/useNewCustomersData';

interface NewCustomersTableProps {
  customers: NewCustomer[];
  isLoading: boolean;
}

export const NewCustomersTable: React.FC<NewCustomersTableProps> = ({ 
  customers, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading customer data...</p>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No new customers found in the selected time period.</p>
      </div>
    );
  }

  // Group customers by month for better display
  const customersByMonth = customers.reduce<Record<string, NewCustomer[]>>((acc, customer) => {
    if (!acc[customer.year_month]) {
      acc[customer.year_month] = [];
    }
    acc[customer.year_month].push(customer);
    return acc;
  }, {});

  return (
    <div className="w-full">
      {Object.entries(customersByMonth).map(([month, monthCustomers]) => (
        <div key={month} className="mb-8">
          <h3 className="text-lg font-medium mb-4 px-2 py-1 bg-muted rounded-sm">
            {format(parseISO(`${month}-01`), 'MMMM yyyy')}
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Customer Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead className="w-[150px]">Salesperson</TableHead>
                <TableHead className="w-[180px] text-right">First Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthCustomers.map((customer) => (
                <TableRow key={customer.customer_code}>
                  <TableCell className="font-medium">{customer.customer_code}</TableCell>
                  <TableCell>{customer.customer_name}</TableCell>
                  <TableCell>{customer.salesperson_code || '-'}</TableCell>
                  <TableCell className="text-right">
                    {customer.first_transaction_date 
                      ? format(new Date(customer.first_transaction_date), 'dd MMM yyyy')
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
};
