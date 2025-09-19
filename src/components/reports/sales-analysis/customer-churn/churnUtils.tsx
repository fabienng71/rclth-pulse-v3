import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'CHURNED':
      return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">Churned</Badge>;
    case 'AT_RISK':
      return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">At Risk</Badge>;
    case 'DECLINING':
      return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Declining</Badge>;
    default:
      return <Badge variant="default">Active</Badge>;
  }
};

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">Critical</Badge>;
    case 'HIGH':
      return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">High</Badge>;
    case 'MEDIUM':
      return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Medium</Badge>;
    case 'LOW':
      return <Badge variant="outline" className="bg-background-tertiary text-muted-foreground border-border/30">Low</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'GROWING':
      return <TrendingUp className="h-4 w-4 text-primary" />;
    case 'DECLINING':
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

export const getRiskScoreColor = (score: number) => {
  if (score >= 70) return 'text-destructive';
  if (score >= 50) return 'text-warning';
  if (score >= 30) return 'text-secondary';
  return 'text-muted-foreground';
};

export const exportChurnData = (data: any[]) => {
  const csvContent = [
    ['Customer Code', 'Customer Name', 'Status', 'Risk Score', 'Historical Value', 'Recent Value', 'Weeks Since Last Order', 'Priority', 'Suggested Action'],
    ...data.map(customer => [
      customer.customer_code,
      customer.customer_name,
      customer.churn_status,
      customer.risk_score,
      customer.historical_value,
      customer.recent_value,
      customer.weeks_since_last_order,
      customer.recovery_priority,
      customer.suggested_action
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customer-churn-analysis-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};