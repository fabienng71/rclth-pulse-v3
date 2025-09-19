import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductMarginIntelligenceProps {
  data: any[];
  isLoading: boolean;
}

export const ProductMarginIntelligence: React.FC<ProductMarginIntelligenceProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Margin Intelligence</CardTitle>
          <CardDescription>Loading product margin analysis...</CardDescription>
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
        <CardTitle>Product Margin Intelligence</CardTitle>
        <CardDescription>Deep dive into product-level margin performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground">
          Product margin intelligence component
        </div>
      </CardContent>
    </Card>
  );
};