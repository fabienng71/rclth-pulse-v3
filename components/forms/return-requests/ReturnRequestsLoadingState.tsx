import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ReturnRequestsLoadingState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CardContent>
    </Card>
  );
};