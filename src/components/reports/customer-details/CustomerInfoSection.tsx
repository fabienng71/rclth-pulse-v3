import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, User, Building2 } from 'lucide-react';
import { CustomerWithAnalytics } from '@/hooks/useCustomerReportEnhanced';
import { useCustomerSalespersonData, CustomerWithSalesperson } from '@/hooks/useCustomerSalespersonData';

interface CustomerInfoSectionProps {
  customers: CustomerWithAnalytics[];
}

const SalespersonGroup: React.FC<{ 
  salespersonCode: string; 
  customers: CustomerWithSalesperson[];
  isUnassigned?: boolean;
}> = ({ salespersonCode, customers, isUnassigned = false }) => {
  const salesperson = customers[0]?.salesperson;
  
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        {isUnassigned ? (
          <>
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Unassigned</span>
          </>
        ) : (
          <>
            <User className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">
                {salesperson.name || salesperson.code || 'Unknown'}
              </span>
              {salesperson.name && salesperson.code && (
                <span className="text-sm text-muted-foreground">
                  Code: {salesperson.code}
                </span>
              )}
              {salesperson.email && (
                <span className="text-xs text-muted-foreground">
                  {salesperson.email}
                </span>
              )}
            </div>
          </>
        )}
        <Badge variant="outline" className="ml-auto">
          {customers.length} {customers.length === 1 ? 'customer' : 'customers'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {customers.map(({ customer }) => (
          <div 
            key={customer.customer_code}
            className="bg-muted/50 rounded-md p-3 space-y-1"
          >
            <div className="font-medium text-sm">{customer.customer_code}</div>
            <div className="text-sm">{customer.customer_name}</div>
            {customer.search_name && (
              <div className="text-xs text-muted-foreground">
                {customer.search_name}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="text-xs">
                ${customer.total_turnover.toLocaleString()}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  customer.health_score >= 80 ? 'border-green-500 text-green-700' :
                  customer.health_score >= 60 ? 'border-blue-500 text-blue-700' :
                  customer.health_score >= 40 ? 'border-yellow-500 text-yellow-700' :
                  'border-red-500 text-red-700'
                }`}
              >
                Health: {customer.health_score}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-20 ml-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-muted/50 rounded-md p-3 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({ customers }) => {
  const { 
    customersBySalesperson, 
    isLoading, 
    totalCustomers, 
    totalSalespeople 
  } = useCustomerSalespersonData(customers);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Selected Customers
          <Badge variant="outline" className="ml-2">
            {totalCustomers} customers across {totalSalespeople} {totalSalespeople === 1 ? 'salesperson' : 'salespeople'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          Object.entries(customersBySalesperson).map(([salespersonCode, customers]) => (
            <SalespersonGroup
              key={salespersonCode}
              salespersonCode={salespersonCode}
              customers={customers}
              isUnassigned={salespersonCode === 'unassigned'}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};