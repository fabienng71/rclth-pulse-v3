
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedReturnRequestsCard from '@/components/forms/EnhancedReturnRequestsCard';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

const ReturnForm = () => {
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
            <h1 className="text-3xl font-bold">Return Requests</h1>
          </div>
          
          <Button 
            onClick={() => navigate('/forms/return/submit')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Return Request
          </Button>
        </div>
        
        <EnhancedReturnRequestsCard />
      </div>
    </div>
  );
};

export default ReturnForm;
