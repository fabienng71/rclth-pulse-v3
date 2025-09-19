
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';

const SampleRequestsLoading: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sample Requests</CardTitle>
        <CardDescription>View and manage sample requests you've submitted</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-muted-foreground">Loading sample requests...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SampleRequestsLoading;
