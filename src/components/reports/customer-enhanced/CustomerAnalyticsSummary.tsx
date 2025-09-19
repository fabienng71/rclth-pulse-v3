import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, Activity, AlertCircle } from 'lucide-react';

interface CustomerAnalyticsSummaryProps {
  analytics: {
    totalCustomers: number;
    totalTurnover: number;
    averageHealthScore: number;
    atRiskCount: number;
  };
}

export const CustomerAnalyticsSummary: React.FC<CustomerAnalyticsSummaryProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{analytics.totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Turnover</p>
              <p className="text-xs text-muted-foreground mb-1">(Last 12 Months)</p>
              <p className="text-2xl font-bold">{Math.round(analytics.totalTurnover).toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Health Score</p>
              <p className="text-2xl font-bold">{analytics.averageHealthScore.toFixed(1)}</p>
            </div>
            <Activity className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">At Risk</p>
              <p className="text-2xl font-bold text-red-600">{analytics.atRiskCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};