import React, { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import EnhancedSampleForm from '@/components/forms/sample/EnhancedSampleForm';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SampleRequestFormData } from '@/services/sampleRequestService';

const SampleRequestEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: request, isLoading, error } = useQuery({
    queryKey: ['sample-requests', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No request ID provided');
      
      const { data, error } = await supabase
        .from('sample_requests')
        .select(`
          *,
          sample_request_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SampleRequestFormData) => {
      if (!id) throw new Error('No request ID provided');

      // Update the sample request
      const { error: requestError } = await supabase
        .from('sample_requests')
        .update({
          customer_code: data.customerCode,
          customer_name: data.customerName,
          notes: data.notes,
          follow_up_date: data.followUpDate?.toISOString().split('T')[0],
        })
        .eq('id', id);

      if (requestError) throw requestError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('sample_request_items')
        .delete()
        .eq('request_id', id);

      if (deleteError) throw deleteError;

      // Insert new items
      if (data.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('sample_request_items')
          .insert(
            data.items.map(item => ({
              request_id: id,
              item_code: item.item_code,
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              is_free: item.is_free || false,
            }))
          );

        if (itemsError) throw itemsError;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sample request updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['sample-requests', 'detail', id] });
      queryClient.invalidateQueries({ queryKey: ['sample-requests'] });
      navigate('/forms/sample');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update sample request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Memoized submit handler to prevent unnecessary re-renders
  const handleSubmit = useCallback(async (data: SampleRequestFormData): Promise<void> => {
    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      // Error is already handled by the mutation's onError handler
      console.error('Submit failed:', error);
    }
  }, [updateMutation]);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-2xl mb-2">🧪</div>
              <p className="text-lg text-muted-foreground">Loading sample request...</p>
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
                Failed to load sample request: {error.message}
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms/sample')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
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
              <CardTitle>Request Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>The requested sample request could not be found.</p>
              <Button
                variant="outline"
                onClick={() => navigate('/forms/sample')}
                className="mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sample Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Memoized data transformation to prevent unnecessary re-renders
  const transformedData: SampleRequestFormData | null = useMemo(() => {
    if (!request) return null;
    
    return {
      customerCode: request.customer_code,
      customerName: request.customer_name,
      searchName: request.search_name,
      salespersonCode: request.salesperson_code,
      notes: request.notes,
      followUpDate: request.follow_up_date ? new Date(request.follow_up_date) : undefined,
      items: request.sample_request_items || [],
    };
  }, [request]);

  // Don't render form until we have transformed data
  if (!transformedData) {
    return (
      <>
        <Navigation />
        <div className="container py-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="text-2xl mb-2">🧪</div>
              <p className="text-lg text-muted-foreground">Loading sample request...</p>
            </div>
          </div>
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
            onClick={() => navigate('/forms/sample')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sample Requests
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">
            Edit Sample Request
          </h1>
        </div>
        
        <EnhancedSampleForm 
          initialData={transformedData}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          isEditMode={true}
        />
      </div>
    </>
  );
};

export default SampleRequestEdit;
