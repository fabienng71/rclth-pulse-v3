
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import SampleRequestsCard from '@/components/forms/SampleRequestsCard';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';

const SampleRequestList = () => {
  const navigate = useNavigate();

  return (
    <div className="app-background">
      <Navigation />
      <div className="bg-background-container border border-border/20 rounded-lg mx-4 my-6">
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
            <Button onClick={() => navigate('/forms/sample/create')} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Sample Request
            </Button>
          </div>
          
          <SampleRequestsCard />
        </div>
      </div>
    </div>
  );
};

export default SampleRequestList;
