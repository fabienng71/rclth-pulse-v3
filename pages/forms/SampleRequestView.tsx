import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, User, Clock, Calendar, Package } from 'lucide-react';
import { fetchSampleRequestById } from '@/services/sample-requests';
import { SavePdfButton } from '@/components/forms/sample/SavePdfButton';

// Utility functions for date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SampleRequestView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['sample-requests', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No request ID provided');
      return fetchSampleRequestById(id);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-muted-foreground">Loading sample request details...</p>
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
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Error Loading Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive mb-4">
                Failed to load sample request: {error.message}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms/sample')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sample Requests
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Request Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">The requested sample request could not be found.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms/sample')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sample Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // useMemo hook AFTER conditional returns to prevent hooks order violation
  const pdfFormData = useMemo(() => {
    if (!request) return null;
    
    return {
      customerCode: request.customer_code,
      customerName: request.customers?.customer_name || request.customer_code,
      searchName: request.customers?.search_name,
      followUpDate: request.follow_up_date ? new Date(request.follow_up_date) : undefined,
      notes: request.notes || '',
      items: request.sample_request_items?.map(item => ({
        item_code: item.item_code,
        description: item.description || '',
        quantity: item.quantity,
        is_free: item.is_free,
        price: item.price
      })) || [],
      createdByName: request.created_by_name,
      salespersonCode: request.salesperson_code
    };
  }, [request]);

  return (
    <>
      <Navigation />
      <div className="container py-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/forms/sample')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sample Requests
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Sample Request Details</h1>
              <p className="text-muted-foreground">
                Request #{request.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {pdfFormData && (
              <SavePdfButton
                formData={pdfFormData}
                requestId={request.id}
                requestNumber={request.id.slice(0, 8).toUpperCase()}
                createdAt={request.created_at}
                variant="outline"
                size="default"
              />
            )}
            <Button
              variant="default"
              onClick={() => navigate(`/forms/sample/edit/${request.id}`)}
            >
              Edit Request
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                <p className="text-lg font-semibold">
                  {request.customers?.search_name || request.customers?.customer_name || request.customer_code}
                </p>
                {request.customers?.search_name && request.customers?.customer_name && 
                 request.customers.search_name !== request.customers.customer_name && (
                  <p className="text-sm text-muted-foreground">{request.customers.customer_name}</p>
                )}
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Customer Code</label>
                <p className="font-mono text-sm bg-muted px-2 py-1 rounded w-fit">
                  {request.customer_code}
                </p>
              </div>
              {request.salesperson_code && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Salesperson</label>
                    <p className="font-medium">{request.salesperson_code}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDateTime(request.created_at)}
                </p>
              </div>
              
              {request.follow_up_date && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Follow-up Date</label>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.follow_up_date)}
                    </p>
                  </div>
                </>
              )}

              {request.created_by_name && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created By</label>
                    <p className="font-medium">{request.created_by_name}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes Section */}
        {request.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{request.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sample Items */}
        {request.sample_request_items && request.sample_request_items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sample Items
                <Badge variant="secondary" className="ml-2">
                  {request.sample_request_items.length} item{request.sample_request_items.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.sample_request_items.map((item: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-lg">{item.item_code}</h4>
                        {item.description && (
                          <p className="text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                      {item.is_free && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Free Sample
                        </Badge>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <label className="font-medium text-muted-foreground">Quantity</label>
                        <p className="text-lg font-semibold">{item.quantity}</p>
                      </div>
                      
                      {item.price && (
                        <div>
                          <label className="font-medium text-muted-foreground">Price</label>
                          <p className="text-lg font-semibold">${item.price}</p>
                        </div>
                      )}
                      
                      {item.price && item.quantity && (
                        <div>
                          <label className="font-medium text-muted-foreground">Total</label>
                          <p className="text-lg font-semibold">
                            ${(parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default SampleRequestView;
