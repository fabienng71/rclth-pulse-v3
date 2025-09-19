
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const SampleRequestsEmpty: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sample Requests</CardTitle>
        <CardDescription>View and manage sample requests you've submitted</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No sample requests found</p>
        <Button onClick={() => navigate('/forms/sample/create')} variant="outline" className="mt-4">
          Create your first sample request
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleRequestsEmpty;
