import React from 'react';
import { CustomerChurnAnalysis } from '@/hooks/useSalesAnalytics';

interface RecommendedActionsProps {
  data: CustomerChurnAnalysis[];
}

export const RecommendedActions: React.FC<RecommendedActionsProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-background-secondary rounded-lg">
      <h3 className="font-semibold mb-3">Recommended Actions</h3>
      <div className="space-y-2">
        {data.slice(0, 3).map((customer) => (
          <div key={customer.customer_code} className="flex items-center justify-between p-2 bg-background-tertiary rounded">
            <div>
              <span className="font-medium">{customer.customer_name}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({customer.churn_status})
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {customer.suggested_action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};