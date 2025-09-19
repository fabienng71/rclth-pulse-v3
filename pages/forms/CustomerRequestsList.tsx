
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import { CustomerRequestsTable } from '@/components/forms/customer-request/CustomerRequestsTable';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const CustomerRequestsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['customer-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDataRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-requests'] });
  };

  return (
    <>
      <Navigation />
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Customer Requests</h1>
            <p className="text-muted-foreground">
              Manage and track customer requests
            </p>
          </div>
          <Button onClick={() => navigate('/forms/customer/create')}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Customer Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-lg text-muted-foreground">Loading requests...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive">Failed to load requests: {error.message}</p>
              </div>
            ) : requests && requests.length > 0 ? (
              <CustomerRequestsTable 
                requests={requests} 
                onDataRefresh={handleDataRefresh}
              />
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">No requests found</h3>
                <p className="text-muted-foreground mb-6">
                  No customer requests have been submitted yet.
                </p>
                <Button onClick={() => navigate('/forms/customer/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CustomerRequestsList;
