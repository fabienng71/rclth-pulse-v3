
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import SampleForm from '@/components/forms/SampleForm';
import { useSampleRequestForm } from '@/hooks/useSampleRequestForm';
import { SampleRequestFormData } from '@/services/sampleRequestService';

const SampleFormPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    formData, 
    isSubmitting, 
    submitForm 
  } = useSampleRequestForm();
  
  const handleSubmit = async (data: SampleRequestFormData) => {
    try {
      console.log('SampleFormPage - Submitting data from form:', data);
      // Pass the data from the form component to the submitForm function
      await submitForm(data);
      
      // The success toast is handled in the hook
      navigate('/forms');
    } catch (error) {
      console.error('Error submitting sample request:', error);
      toast({
        title: "Error",
        description: "Failed to submit sample request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/forms')} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forms
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Create Sample Request</h1>
          <p className="text-muted-foreground">Fill out the form below to create a new sample request</p>
        </div>
        
        <SampleForm 
          initialData={formData} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </div>
  );
};

export default SampleFormPage;
