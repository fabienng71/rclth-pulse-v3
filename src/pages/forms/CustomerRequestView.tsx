import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { EnhancedCustomerRequestView } from '@/components/forms/customer-request/EnhancedCustomerRequestView';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

interface Contact {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  line?: string;
  whatsapp?: string;
}

const CustomerRequestView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['customer-request', id],
    queryFn: async () => {
      if (!id) throw new Error('No request ID provided');
      
      const { data, error } = await supabase
        .from('customer_requests')
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
              <div className="text-2xl mb-2">📄</div>
              <p className="text-lg text-muted-foreground">Loading customer request...</p>
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
                Failed to load customer request: {error.message}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms/customer')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customer Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!request) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The requested customer request could not be found.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms/customer')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customer Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Transform the request data to match the expected interface with proper type casting
  const transformedRequest = {
    ...request,
    contacts: Array.isArray(request.contacts) 
      ? (request.contacts as unknown as Contact[])
      : [],
    documents: typeof request.documents === 'object' && request.documents !== null 
      ? (request.documents as unknown as { pp20?: boolean; company_registration?: boolean; id_card?: boolean; })
      : {},
  };

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/forms/customer')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customer Requests
            </Button>
            <Button
              onClick={() => navigate(`/forms/customer/edit/${id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Request
            </Button>
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Customer Request Details
          </h1>
          <p className="text-muted-foreground">
            View comprehensive customer maintenance request information.
          </p>
        </div>
        
        <EnhancedCustomerRequestView request={transformedRequest} />
      </div>
    </>
  );
};

export default CustomerRequestView;
