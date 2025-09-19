
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  fetchUserCustomerRequests,
  fetchCustomerRequestById,
  createCustomerRequest,
  updateCustomerRequest,
  updateRequestStatus,
  deleteCustomerRequest,
  sendCustomerRequestEmail,
  type CustomerRequest,
} from '@/services/customer-requests';
import { CustomerRequestFormValues } from '@/components/forms/customer/schema';

export const useCustomerRequests = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query for fetching all requests
  const {
    data: customerRequests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customerRequests'],
    queryFn: async () => {
      const { data, error } = await fetchUserCustomerRequests();
      if (error) throw error;
      return data || [];
    },
  });

  // Filter customer requests based on search query
  const filteredRequests = customerRequests?.filter((request) => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    return (
      request.customer_name.toLowerCase().includes(search) ||
      (request.search_name && request.search_name.toLowerCase().includes(search))
    );
  });

  // Mutation for creating a new request
  const createMutation = useMutation({
    mutationFn: ({ data, isDraft }: { data: CustomerRequestFormValues; isDraft: boolean }) => 
      createCustomerRequest(data, isDraft),
    onSuccess: (result) => {
      if (result.data) {
        toast({
          title: "Success",
          description: result.data.status === 'draft' ? 
            "Customer request saved as draft" : 
            "Customer request submitted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['customerRequests'] });
        if (!result.data.status || result.data.status !== 'draft') {
          navigate('/forms/customer');
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to submit customer request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for sending email
  const emailMutation = useMutation({
    mutationFn: ({ requestId, email }: { requestId: string; email: string }) => 
      sendCustomerRequestEmail(requestId, email),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email notification sent successfully",
      });
      setIsSendingEmail(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send email notification: ${error.message}`,
        variant: "destructive",
      });
      setIsSendingEmail(false);
    },
  });

  // Mutation for updating a request status
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'pending' | 'draft' }) =>
      updateRequestStatus(id, status),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['customerRequests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update request status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a request
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomerRequest(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['customerRequests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete customer request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Function to handle saving draft
  const saveDraft = (data: CustomerRequestFormValues) => {
    return createMutation.mutateAsync({ data, isDraft: true });
  };

  // Function to handle submit request
  const submitRequest = (data: CustomerRequestFormValues) => {
    return createMutation.mutateAsync({ data, isDraft: false });
  };

  // Function to handle send email
  const sendEmail = async (data: CustomerRequestFormValues, email: string) => {
    setIsSendingEmail(true);
    // First create or update the request
    const result = await createCustomerRequest(data, false);
    if (result.error || !result.data) {
      toast({
        title: "Error",
        description: `Failed to save customer request: ${result.error?.message || "Unknown error"}`,
        variant: "destructive",
      });
      setIsSendingEmail(false);
      return;
    }

    // Then send the email
    emailMutation.mutate({ requestId: result.data.id, email });
  };

  // Function to handle approve action
  const handleApprove = (id: string) => {
    statusMutation.mutate({ id, status: 'approved' });
  };

  // Function to handle reject action
  const handleReject = (id: string) => {
    statusMutation.mutate({ id, status: 'rejected' });
  };

  // Function to handle view action
  const handleViewRequest = (id: string) => {
    navigate(`/forms/customer/view/${id}`);
  };

  // Function to handle delete action
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return {
    customerRequests: filteredRequests || [],
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    saveDraft,
    submitRequest,
    sendEmail,
    isSavingDraft: createMutation.isPending,
    isSubmitting: createMutation.isPending,
    isSendingEmail: isSendingEmail || emailMutation.isPending,
    handleApprove,
    handleReject,
    handleViewRequest,
    handleDelete,
    formatDate,
    getStatusBadgeClass,
    isProcessing: statusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useCustomerRequest = (id: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Query for fetching a specific request
  const {
    data: customerRequest,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customerRequest', id],
    queryFn: async () => {
      const { data, error } = await fetchCustomerRequestById(id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Mutation for updating a request
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CustomerRequestFormValues> | { status: string }) => 
      updateCustomerRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerRequest', id] });
      queryClient.invalidateQueries({ queryKey: ['customerRequests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update customer request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for sending email
  const emailMutation = useMutation({
    mutationFn: (email: string) => sendCustomerRequestEmail(id, email),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email notification sent successfully",
      });
      setIsSendingEmail(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send email notification: ${error.message}`,
        variant: "destructive",
      });
      setIsSendingEmail(false);
    },
  });

  // Mutation for updating request status
  const statusMutation = useMutation({
    mutationFn: (status: 'approved' | 'rejected' | 'pending' | 'draft') => 
      updateRequestStatus(id, status),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['customerRequest', id] });
      queryClient.invalidateQueries({ queryKey: ['customerRequests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update request status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const sendEmail = (requestId: string, email: string) => {
    setIsSendingEmail(true);
    emailMutation.mutate(email);
  };

  return {
    customerRequest,
    isLoading,
    error,
    updateRequest: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    approveRequest: () => statusMutation.mutate('approved'),
    rejectRequest: () => statusMutation.mutate('rejected'),
    updateStatus: statusMutation.mutate,
    isProcessingStatus: statusMutation.isPending,
    sendEmail,
    isSendingEmail: isSendingEmail || emailMutation.isPending,
  };
};
