import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNewCustomersData } from '@/hooks/useNewCustomersData';

const NewCustomersMonthDetail = () => {
  const { month } = useParams<{ month: string }>();
  const navigate = useNavigate();

  const { customers: rawCustomers, isLoading, error } = useNewCustomersData(12, month);

  // Deduplicate customers by customer_code to ensure uniqueness
  const uniqueCustomers = useMemo(() => {
    if (!rawCustomers || rawCustomers.length === 0) return [];
    
    const customerMap = new Map();
    
    rawCustomers.forEach(customer => {
      if (!customerMap.has(customer.customer_code)) {
        customerMap.set(customer.customer_code, customer);
      }
    });
    
    return Array.from(customerMap.values());
  }, [rawCustomers]);

  if (isLoading) {
    return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-2xl mb-2">📈</div>
              <p className="text-lg text-muted-foreground">Loading monthly customer data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-primary transition-smooth">
        <Navigation />
        <div className="container py-6">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                Failed to load customer data: {error.message}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background-primary transition-smooth">
      <Navigation />
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/reports/new-customers')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to New Customers Report
          </Button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              New Customers - {month}
            </h1>
            <p className="text-muted-foreground">
              Detailed view of customers who made their first order in {month}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {uniqueCustomers?.length || 0} New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uniqueCustomers && uniqueCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Code</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>First Order Date</TableHead>
                    <TableHead>Search Name</TableHead>
                    <TableHead>Salesperson Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueCustomers.map((customer) => (
                    <TableRow key={customer.customer_code}>
                      <TableCell className="font-medium">{customer.customer_code}</TableCell>
                      <TableCell>{customer.customer_name}</TableCell>
                      <TableCell>{formatDate(customer.first_transaction_date)}</TableCell>
                      <TableCell>{customer.search_name || '-'}</TableCell>
                      <TableCell>{customer.salesperson_code || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No new customers found for this month.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewCustomersMonthDetail;
