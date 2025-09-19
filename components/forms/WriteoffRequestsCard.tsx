import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileX, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WriteoffRequestsCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-2">
          <FileX className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-lg">Write-off Requests</CardTitle>
            <CardDescription>
              Submit inventory write-off requests
            </CardDescription>
          </div>
        </div>
        <Badge variant="secondary">New</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => navigate('/forms/writeoff/create')}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Write-off
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/forms/writeoff')}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};