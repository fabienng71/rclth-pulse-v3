import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { LeadCenterForm } from '@/components/lead-center/LeadCenterForm';

const LeadCenterCreate = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/crm/lead-center')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Create New Lead</h1>
            <p className="text-muted-foreground">
              Add a new lead to your pipeline
            </p>
          </div>
        </div>

        <LeadCenterForm />
      </div>
    </>
  );
};

export default LeadCenterCreate;