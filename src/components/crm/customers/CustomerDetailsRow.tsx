
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Activity, Plus } from 'lucide-react';
import { CustomerWithAnalytics } from '@/hooks/useCustomersWithAnalytics';
import { CustomerSamplesList } from './CustomerSamplesList';
import { CustomerActivitiesList } from './CustomerActivitiesList';

interface CustomerDetailsRowProps {
  customer: CustomerWithAnalytics;
}

export const CustomerDetailsRow: React.FC<CustomerDetailsRowProps> = ({ customer }) => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="p-0">
        <div className="bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Samples Sent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{customer.sample_requests_count}</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Total sample requests
                  </p>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Send Sample
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{customer.activities_count}</div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Total activities recorded
                  </p>
                  <Button size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />
                    Create Activity
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerSamplesList customerCode={customer.customer_code} />
              <CustomerActivitiesList customerCode={customer.customer_code} />
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
