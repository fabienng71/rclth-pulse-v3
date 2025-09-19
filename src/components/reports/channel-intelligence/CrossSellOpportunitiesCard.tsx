import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CrossSellOpportunitiesCardProps {
  data: any[];
  isLoading: boolean;
}

export const CrossSellOpportunitiesCard: React.FC<CrossSellOpportunitiesCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cross-Sell Opportunities</CardTitle>
          <CardDescription>Loading cross-sell analysis...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cross-Sell Opportunities</CardTitle>
        <CardDescription>Product combinations and basket optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          Cross-sell opportunities component
        </div>
      </CardContent>
    </Card>
  );
};