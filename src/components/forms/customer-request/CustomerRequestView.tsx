
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerRequestViewProps {
  request: any;
}

export const CustomerRequestView: React.FC<CustomerRequestViewProps> = ({ request }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Request Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Customer Name</label>
            <p className="text-sm text-muted-foreground">{request.customer_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <p className="text-sm text-muted-foreground">{request.status}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Created At</label>
            <p className="text-sm text-muted-foreground">
              {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
