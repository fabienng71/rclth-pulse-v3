
import { useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { CreateReturnRequestData } from '../services/returnRequestService';
import { ReturnRequest } from '../ReturnRequestTable';
import { createAdminNotification } from '@/services/notificationService';

export const useReturnRequests = () => {
  const [loading, setLoading] = useState(false);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();

  const fetchReturnRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use a simpler query that doesn't try to join with profiles
      const { data, error } = await supabase
        .from('return_requests')
        .select('*, customers:customer_code (*), items:product_code (*)')
        .filter('deleted', 'eq', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data
      const returnData: ReturnRequest[] = data.map(item => ({
        id: item.id,
        customer_code: item.customer_code,
        product_code: item.product_code,
        return_date: item.return_date,
        reason: item.reason,
        comment: item.comment,
        status: item.status,
        return_quantity: item.return_quantity,
        created_at: item.created_at,
        deleted: item.deleted || false,
        full_name: item.full_name || 'Unknown',
        customers: item.customers,
        items: item.items
      }));

      setReturnRequests(returnData || []);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      console.error('Error fetching return requests:', err);
    }
  }, []); // Remove dependencies to prevent infinite loop

  const createReturnRequest = useCallback(async (data: CreateReturnRequestData) => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newRequest = {
        customer_code: data.customerCode,
        product_code: data.productCode,
        return_date: data.returnDate,
        reason: data.reason,
        comment: data.comment,
        return_quantity: data.returnQuantity,
        created_by: user.id,
        full_name: profile?.full_name
      };

      const { data: createdRequest, error } = await supabase
        .from('return_requests')
        .insert(newRequest)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send notification to admins about the new return request
      if (createdRequest && createdRequest.id) {
        await createAdminNotification(
          'return_request',
          createdRequest.id,
          'New Return Request',
          `A new return request has been created for customer ${data.customerCode}`
        );
      }

      toast({
        title: "Success",
        description: "Return request created successfully",
      });
      
      navigate('/forms/return');
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      toast({
        title: "Error",
        description: (err as Error).message || "Something went wrong",
        variant: "destructive",
      });
      console.error('Error creating return request:', err);
    }
  }, [user?.id, profile?.full_name, toast, navigate]);

  const deleteReturnRequest = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const { error } = await supabase
        .from('return_requests')
        .update({ deleted: true })
        .eq('id', id);
  
      if (error) {
        throw error;
      }
  
      setReturnRequests(prevRequests =>
        prevRequests.filter(request => request.id !== id)
      );
  
      toast({
        title: "Success",
        description: "Return request deleted successfully",
      });
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      toast({
        title: "Error",
        description: (err as Error).message || "Something went wrong",
        variant: "destructive",
      });
      console.error('Error deleting return request:', err);
    }
  }, [toast]);

  const filteredRequests = useMemo(() => {
    let filtered = [...returnRequests];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(request => request.status === filterStatus);
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(request =>
        request.customer_code.toLowerCase().includes(lowerCaseQuery) ||
        request.product_code.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return filtered;
  }, [returnRequests, filterStatus, searchQuery]);

  return {
    loading,
    returnRequests: filteredRequests,
    error,
    fetchReturnRequests,
    createReturnRequest,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    deleteReturnRequest
  };
};
