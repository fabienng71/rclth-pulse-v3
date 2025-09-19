
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { fetchReturnRequest } from '@/services/returnRequestService';
import { supabase } from '@/integrations/supabase/client';
import type { ReturnFormValues } from '../returnFormSchema';

export const useReturnFormLoader = (id: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [returnRequestCreator, setReturnRequestCreator] = useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadReturnRequest = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to edit a return request",
          variant: "destructive",
        });
        navigate('/forms/return');
        return null;
      }

      setIsLoading(true);
      const returnRequest = await fetchReturnRequest(id);

      if (!returnRequest) {
        toast({
          title: "Error",
          description: "Return request not found",
          variant: "destructive",
        });
        navigate('/forms/return');
        return null;
      }

      // Check if user is the creator of this return request
      setReturnRequestCreator(returnRequest.created_by);
      const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
      const isCreator = returnRequest.created_by === user.id;

      if (!isAdmin && !isCreator) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit this return request",
          variant: "destructive",
        });
        navigate('/forms/return');
        return null;
      }

      // Fetch the return request items separately
      const { data: items, error: itemsError } = await supabase
        .from('return_request_items')
        .select('*')
        .eq('return_request_id', id);

      if (itemsError) {
        console.error('Error fetching return request items:', itemsError);
        toast({
          title: "Error",
          description: "Could not load return request items",
          variant: "destructive",
        });
        return null;
      }

      // For legacy support, if there are items, use the first item for the old form structure
      // This is a temporary solution for editing old-style return requests
      const firstItem = items && items.length > 0 ? items[0] : null;

      // Format the data for the old form structure (legacy compatibility)
      const formData: ReturnFormValues & {
        customerName?: string;
        customerSearchName?: string | null;
        productDescription?: string | null;
      } = {
        customerCode: returnRequest.customer_code,
        productCode: firstItem?.item_code || '', // Use first item's code or empty string
        returnQuantity: firstItem?.quantity || 1, // Use first item's quantity or default to 1
        returnDate: new Date(returnRequest.return_date),
        reason: firstItem?.reason || '', // Use first item's reason or empty string
        comment: returnRequest.notes || '', // Use notes field as comment
        // Add extra fields for convenience
        customerName: returnRequest.customers?.customer_name,
        customerSearchName: returnRequest.customers?.search_name,
        productDescription: firstItem?.description
      };

      setIsLoading(false);
      return formData;
    } catch (error) {
      console.error('Error fetching return request:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Could not load return request",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    // Only set initial loading state, actual data loading is triggered by parent component
    if (id) {
      setIsLoading(true);
    }
  }, [id]);

  return {
    isLoading,
    returnRequestCreator,
    loadReturnRequest
  };
};
