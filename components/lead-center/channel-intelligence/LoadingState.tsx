import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Intelligence Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Analyzing channel performance...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};