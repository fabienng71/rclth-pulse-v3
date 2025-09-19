import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import ReturnRequestHeader from '@/components/forms/return-view/ReturnRequestHeader';
import CustomerInfoSection from '@/components/forms/return-view/CustomerInfoSection';
import ReturnDetailsSection from '@/components/forms/return-view/ReturnDetailsSection';
import ReasonSection from '@/components/forms/return-view/ReasonSection';
import ReturnRequestFooter from '@/components/forms/return-view/ReturnRequestFooter';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ReturnRequestView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: returnRequest, isLoading, error } = useQuery({
    queryKey: ['return-request', id],
    queryFn: async () => {
      if (!id) throw new Error('No return request ID provided');
      
      const { data, error } = await supabase
        .from('return_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddLogo = () => {
    console.log('Add logo functionality not implemented yet');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-lg text-muted-foreground">Loading return request...</p>
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
                Failed to load return request: {error.message}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forms
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!returnRequest) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <Card>
            <CardHeader>
              <CardTitle>Return Request Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The requested return request could not be found.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forms
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const createdByName = returnRequest.full_name || 'Unknown User';

  return (
    <>
      <Navigation />
      <div className="container py-6 max-w-4xl">
        <ReturnRequestHeader
          id={returnRequest.id}
          status={returnRequest.status}
          onAddLogo={handleAddLogo}
          onPrint={handlePrint}
        />

        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <CustomerInfoSection
                customerCode={returnRequest.customer_code}
                productCode={returnRequest.product_code}
              />
              
              <ReturnDetailsSection
                returnDate={returnRequest.return_date}
                returnQuantity={returnRequest.return_quantity}
                status={returnRequest.status}
              />
            </div>

            <ReasonSection
              reason={returnRequest.reason}
              comment={returnRequest.comment}
            />

            <ReturnRequestFooter
              createdAt={returnRequest.created_at}
              createdBy={createdByName}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ReturnRequestView;
