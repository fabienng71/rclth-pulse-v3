
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import EnhancedSampleForm from '@/components/forms/sample/EnhancedSampleForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSampleRequestForm } from '@/hooks/useSampleRequestForm';

const SampleRequestCreate = () => {
  const navigate = useNavigate();
  const { submitForm, isSubmitting } = useSampleRequestForm();

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container py-10">
        <Button 
          variant="outline" 
          onClick={() => navigate('/forms/sample')} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> 
          Back to Sample Requests
        </Button>
        
        <EnhancedSampleForm 
          onSubmit={submitForm} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
};

export default SampleRequestCreate;
