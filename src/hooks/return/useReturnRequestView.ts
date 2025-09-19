
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchReturnRequest } from '@/services/returnRequestService';
import { getDefaultLogo, saveDefaultLogo } from '@/utils/logoStorage';

export interface ReturnRequest {
  id: string;
  customer_code: string;
  return_date: string;
  priority: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted: boolean;
  customers?: {
    customer_name: string;
    search_name: string | null;
  } | null;
  profiles?: {
    full_name: string;
  } | null;
  // Items will be fetched separately
  items?: Array<{
    id: string;
    item_code: string;
    description: string;
    quantity: number;
    unit?: string;
    reason: string;
  }>;
}

export const useReturnRequestView = (id: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [request, setRequest] = useState<ReturnRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const getReturnRequest = async () => {
      try {
        setLoading(true);
        if (!id) return;
        
        const requestData = await fetchReturnRequest(id);
        
        // Fetch the return request items separately
        const { data: items, error: itemsError } = await supabase
          .from('return_request_items')
          .select('*')
          .eq('return_request_id', id);

        if (itemsError) {
          console.error('Error fetching return request items:', itemsError);
        }

        // Combine the data
        const combinedRequest: ReturnRequest = {
          ...requestData,
          items: items || []
        };

        setRequest(combinedRequest);
      } catch (error) {
        console.error('Error fetching return request:', error);
        toast({
          title: "Error",
          description: "Failed to load return request details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getReturnRequest();
  }, [id, toast]);

  useEffect(() => {
    const loadSavedLogo = async () => {
      const savedLogoPath = getDefaultLogo();
      if (savedLogoPath) {
        setLogoPath(savedLogoPath);
        const publicUrl = supabase.storage.from('documents').getPublicUrl(savedLogoPath).data.publicUrl;
        setLogoUrl(publicUrl);
      }
    };
    
    loadSavedLogo();
  }, []);

  const handleLogoSelect = (logoPath: string) => {
    setLogoPath(logoPath);
    saveDefaultLogo(logoPath);
    const publicUrl = supabase.storage.from('documents').getPublicUrl(logoPath).data.publicUrl;
    setLogoUrl(publicUrl);
    
    toast({
      title: "Logo selected",
      description: "The logo has been added to the return request",
    });
  };

  return {
    request,
    loading,
    isLogoDialogOpen,
    setIsLogoDialogOpen,
    logoUrl,
    handleLogoSelect,
  };
};
