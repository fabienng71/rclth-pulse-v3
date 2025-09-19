
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SalespersonAnalysisSummaryProps {
  summary: {
    total_customers: number;
    total_amount: number;
    total_quantity: number;
  } | null;
  isLoading: boolean;
}

export const SalespersonAnalysisSummary: React.FC<SalespersonAnalysisSummaryProps> = ({
  summary,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="h-16 bg-muted/20 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const summaryCards = [
    {
      title: 'Total Customers',
      value: summary.total_customers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(summary.total_amount),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Quantity',
      value: summary.total_quantity.toLocaleString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {summaryCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${card.bgColor} mr-4`}>
                  <IconComponent className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
