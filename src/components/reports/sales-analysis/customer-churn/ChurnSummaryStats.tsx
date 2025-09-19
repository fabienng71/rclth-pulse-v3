import React from 'react';
import { AlertTriangle, Clock, TrendingDown, DollarSign } from 'lucide-react';
import { CustomerChurnAnalysis } from '@/hooks/useSalesAnalytics';

interface ChurnSummaryStatsProps {
  data: CustomerChurnAnalysis[];
}

export const ChurnSummaryStats: React.FC<ChurnSummaryStatsProps> = ({ data }) => {
  const churned = data.filter(c => c.churn_status === 'CHURNED');
  const atRisk = data.filter(c => c.churn_status === 'AT_RISK');
  const declining = data.filter(c => c.churn_status === 'DECLINING');
  
  const churnedValue = Math.round(churned.reduce((sum, c) => sum + (c.historical_value || 0), 0));
  const atRiskValue = Math.round(atRisk.reduce((sum, c) => sum + (c.historical_value || 0), 0));
  const decliningValue = Math.round(declining.reduce((sum, c) => sum + (c.historical_value || 0), 0));
  const totalRiskValue = Math.round(data.reduce((sum, c) => sum + (c.historical_value || 0), 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-background-secondary p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">Churned</span>
        </div>
        <p className="text-2xl font-bold text-destructive">
          {churned.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {churnedValue.toLocaleString()} at risk
        </p>
      </div>
      
      <div className="bg-background-secondary p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">At Risk</span>
        </div>
        <p className="text-2xl font-bold text-warning">
          {atRisk.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {atRiskValue.toLocaleString()} at risk
        </p>
      </div>
      
      <div className="bg-background-secondary p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium">Declining</span>
        </div>
        <p className="text-2xl font-bold text-secondary">
          {declining.length}
        </p>
        <p className="text-sm text-muted-foreground">
          {decliningValue.toLocaleString()} at risk
        </p>
      </div>
      
      <div className="bg-background-secondary p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Total Risk Value</span>
        </div>
        <p className="text-2xl font-bold text-primary">
          {totalRiskValue.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          Revenue at risk
        </p>
      </div>
    </div>
  );
};