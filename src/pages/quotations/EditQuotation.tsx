
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuotation } from '@/hooks/useQuotations';
import Navigation from '@/components/Navigation';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const EditQuotation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: quotation, isLoading, error } = useQuotation(id);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-lg text-muted-foreground">Loading quotation...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Quotation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive mb-4">
                Failed to load quotation: {error.message}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/quotations')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Quotations
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!quotation) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">The requested quotation could not be found.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/quotations')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quotations
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

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
          <h1 className="text-2xl font-bold md:text-3xl">Edit Quotation</h1>
          <p className="text-muted-foreground">
            Quote: {quotation.quote_number || 'Draft'} • ID: {quotation.id?.slice(0, 8)}
          </p>
        </div>
        
        <QuotationForm existingQuotation={quotation} isEdit={true} />
      </div>
    </>
  );
};

export default EditQuotation;
