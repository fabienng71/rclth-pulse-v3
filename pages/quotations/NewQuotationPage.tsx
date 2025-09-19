
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewQuotationPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/quotations')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotations
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Create New Quotation</h1>
        </div>
        
        <QuotationForm />
      </div>
    </>
  );
};

export default NewQuotationPage;
