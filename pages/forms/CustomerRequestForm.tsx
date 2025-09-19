
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { EnhancedCustomerRequestForm } from '@/components/forms/customer-request/EnhancedCustomerRequestForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CustomerRequestForm = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/forms/customer')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customer Requests
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">New Customer Request</h1>
          <p className="text-muted-foreground">
            Create a comprehensive customer maintenance request with all required information.
          </p>
        </div>
        
        <EnhancedCustomerRequestForm mode="create" />
      </div>
    </>
  );
};

export default CustomerRequestForm;
