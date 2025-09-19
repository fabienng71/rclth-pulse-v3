
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuotationViewProps {
  quotation: any;
}

export const QuotationView: React.FC<QuotationViewProps> = ({ quotation }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotation Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <p className="text-sm text-muted-foreground">{quotation.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Customer</label>
            <p className="text-sm text-muted-foreground">{quotation.customer_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <p className="text-sm text-muted-foreground">{quotation.status}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Created At</label>
            <p className="text-sm text-muted-foreground">
              {new Date(quotation.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
