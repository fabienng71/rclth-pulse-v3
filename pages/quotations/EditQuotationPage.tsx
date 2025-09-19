
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EditQuotationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: quotation, isLoading, error } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      if (!id) throw new Error('No quotation ID provided');
      
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
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
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">
                Failed to load quotation: {error.message}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/quotations')}
                className="mt-4"
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
              <p>The requested quotation could not be found.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/quotations')}
                className="mt-4"
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
          <p className="text-muted-foreground">ID: {quotation.id?.slice(0, 8)}</p>
        </div>
        
        <QuotationForm />
      </div>
    </>
  );
};

export default EditQuotationPage;
