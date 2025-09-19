import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Weekly Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading trend analysis...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};