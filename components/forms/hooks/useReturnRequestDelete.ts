
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { deleteReturnRequest } from '../services/returnRequestService';
import { useAuthStore } from '@/stores/authStore';
import { ReturnRequest } from '../ReturnRequestTable';

export const useReturnRequestDelete = (onDeleteSuccess: (id: string) => void) => {
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this return request?')) {
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a return request",
        variant: "destructive",
      });
      return;
    }

    try {
      setDeleteInProgress(true);
      await deleteReturnRequest(id, user);
      
      toast({
        title: "Success",
        description: "Return request deleted successfully",
      });
      
      onDeleteSuccess(id);
    } catch (error) {
      console.error('Error deleting return request:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? `Failed to delete: ${error.message}` 
          : "Failed to delete return request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteInProgress(false);
    }
  };

  return {
    deleteInProgress,
    handleDeleteRequest
  };
};
