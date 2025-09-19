
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import SampleRequestsCard from '@/components/forms/sample-requests/SampleRequestsCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EnhancedSampleRequestList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/forms')} 
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forms
            </Button>
            <h1 className="text-3xl font-bold">Sample Requests</h1>
          </div>
        </div>
        
        <SampleRequestsCard />
      </div>
    </div>
  );
};

export default EnhancedSampleRequestList;
