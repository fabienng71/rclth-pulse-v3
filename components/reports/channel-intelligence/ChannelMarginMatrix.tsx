import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChannelMarginMatrixProps {
  data: any[];
  isLoading: boolean;
}

export const ChannelMarginMatrix: React.FC<ChannelMarginMatrixProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Margin Matrix</CardTitle>
          <CardDescription>Loading margin analysis...</CardDescription>
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
        <CardTitle>Channel Margin Matrix</CardTitle>
        <CardDescription>Performance matrix showing revenue vs margin by channel</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Matrix visualization would go here */}
        <div className="text-center text-muted-foreground">
          Matrix visualization component
        </div>
      </CardContent>
    </Card>
  );
};