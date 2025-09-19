
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, TrendingUp, Calculator } from 'lucide-react';
import { CollaborativeForecastData } from '@/hooks/useForecastSessions';

interface ForecastSummaryStatsProps {
  collaborativeData: CollaborativeForecastData[];
}

export const ForecastSummaryStats: React.FC<ForecastSummaryStatsProps> = ({
  collaborativeData
}) => {
  // Calculate summary statistics
  const uniqueItems = new Set();
  const uniqueContributors = new Set();
  let totalQuantity = 0;

  collaborativeData.forEach(item => {
    if (item.item_code) {
      uniqueItems.add(item.item_code);
    }
    if (item.contributor_email) {
      uniqueContributors.add(item.contributor_email);
    }
    if (item.forecast_quantity) {
      totalQuantity += item.forecast_quantity;
    }
  });

  const stats = [
    {
      title: 'Total Items',
      value: uniqueItems.size,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Contributors',
      value: uniqueContributors.size,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Total Quantity',
      value: totalQuantity.toLocaleString(),
      icon: Calculator,
      color: 'text-purple-600'
    },
    {
      title: 'Avg per Item',
      value: uniqueItems.size > 0 ? Math.round(totalQuantity / uniqueItems.size).toLocaleString() : '0',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
