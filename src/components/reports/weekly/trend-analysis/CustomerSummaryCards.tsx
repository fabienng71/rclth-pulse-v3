import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, AlertTriangle, Star, Sparkles } from 'lucide-react';
import { CustomerInsight } from '@/hooks/useEnhancedWeeklyData';

interface CustomerSummaryCardsProps {
  customerInsights: CustomerInsight[];
  growingCustomers: CustomerInsight[];
  atRiskCustomers: CustomerInsight[];
  newCustomers: CustomerInsight[];
  reactivatedCustomers: CustomerInsight[];
}

export const CustomerSummaryCards: React.FC<CustomerSummaryCardsProps> = ({
  customerInsights,
  growingCustomers,
  atRiskCustomers,
  newCustomers,
  reactivatedCustomers
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{growingCustomers.length}</p>
              <p className="text-xs text-muted-foreground">Growing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{atRiskCustomers.length}</p>
              <p className="text-xs text-muted-foreground">At Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{newCustomers.length}</p>
              <p className="text-xs text-muted-foreground">New</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{reactivatedCustomers.length}</p>
              <p className="text-xs text-muted-foreground">Reactivated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{customerInsights.length}</p>
              <p className="text-xs text-muted-foreground">Total Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};