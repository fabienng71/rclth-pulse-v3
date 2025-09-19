
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Quotation } from '@/types/quotations';

interface QuotationsStatsProps {
  quotations: Quotation[];
}

export const QuotationsStats: React.FC<QuotationsStatsProps> = ({ quotations }) => {
  const stats = React.useMemo(() => {
    const total = quotations.length;
    const draft = quotations.filter(q => q.status === 'draft').length;
    const sent = quotations.filter(q => q.status === 'sent').length;
    const accepted = quotations.filter(q => q.status === 'accepted').length;
    const rejected = quotations.filter(q => q.status === 'rejected').length;
    const expired = quotations.filter(q => q.status === 'expired').length;
    
    // Calculate expiring soon (within 3 days)
    const expiringSoon = quotations.filter(q => {
      if (q.status === 'sent' || q.status === 'final') {
        const created = new Date(q.created_at);
        const expiry = new Date(created.getTime() + q.validity_days * 24 * 60 * 60 * 1000);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
        return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
      }
      return false;
    }).length;

    // Calculate total value from quotation totals
    const totalValue = quotations.reduce((sum, q) => sum + (q.total || 0), 0);
    
    // Calculate conversion rate
    const conversionRate = sent > 0 ? (accepted / sent) * 100 : 0;

    return {
      total,
      draft,
      sent,
      accepted,
      rejected,
      expired,
      expiringSoon,
      totalValue,
      conversionRate
    };
  }, [quotations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {stats.draft} Draft
            </Badge>
            <Badge variant="outline" className="text-xs">
              {stats.sent} Sent
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Total value of all quotations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-green-500 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {stats.accepted} Accepted
            </Badge>
            <Badge className="bg-red-500 text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              {stats.rejected} Rejected
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.expiringSoon > 0 && (
              <Badge className="bg-orange-500 text-xs w-full justify-start">
                <Clock className="h-3 w-3 mr-1" />
                {stats.expiringSoon} Expiring Soon
              </Badge>
            )}
            {stats.expired > 0 && (
              <Badge className="bg-red-500 text-xs w-full justify-start">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.expired} Expired
              </Badge>
            )}
            {stats.expiringSoon === 0 && stats.expired === 0 && (
              <p className="text-xs text-muted-foreground">No urgent alerts</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
