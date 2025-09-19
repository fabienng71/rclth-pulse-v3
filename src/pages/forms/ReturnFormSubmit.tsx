
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import EnhancedReturnForm, { ReturnRequestFormData } from '@/components/forms/return/EnhancedReturnForm';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { createEnhancedReturnRequest } from '@/services/enhancedReturnRequestService';
import { sendReturnRequestEmail } from '@/services/returnRequestService';

const ReturnFormSubmit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: ReturnRequestFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a return request",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting return request with data:', data);
      
      // Create the return request using the new service
      const result = await createEnhancedReturnRequest(data, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create return request');
      }

      console.log('Return request created successfully with ID:', result.id);
      
      // Send email notification
      if (result.id) {
        console.log('Sending email notification for request ID:', result.id);
        const emailResult = await sendReturnRequestEmail(result.id);
        
        if (emailResult.success) {
          toast({
            title: "Return request submitted",
            description: `Your return request has been successfully submitted with ${data.items.length} item(s) and an email notification has been sent.`,
          });
        } else if (emailResult.isDomainError) {
          toast({
            title: "Return request submitted",
            description: "Your return request has been submitted, but email delivery needs domain verification in Resend.",
            variant: "default",
          });
        } else {
          toast({
            title: "Return request submitted",
            description: "Your return request has been submitted, but there was an issue sending the email notification.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Return request submitted",
          description: `Your return request has been successfully submitted with ${data.items.length} item(s).`,
        });
      }
      
      // Navigate back to the forms page
      setTimeout(() => {
        navigate('/forms/return');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit return request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-10">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/forms/return')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Submit Return Request</h1>
        </div>
        
        <EnhancedReturnForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ReturnFormSubmit;
