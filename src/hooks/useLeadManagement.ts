import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LeadCenter } from '@/types/leadCenter';
import { useToast } from '@/hooks/use-toast';

export interface UseLeadManagementReturn {
  lead: LeadCenter | null;
  isLoading: boolean;
  updateLead: (updates: Partial<LeadCenter>) => Promise<void>;
}

export const useLeadManagement = (leadId: string): UseLeadManagementReturn => {
  const [lead, setLead] = useState<LeadCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLead = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('lead_center')
        .select(`
          *,
          contact:contacts (
            id,
            first_name,
            last_name,
            email
          ),
          customer:customers (
            customer_code,
            customer_name
          )
        `)
        .eq('id', leadId)
        .single();

      if (error) throw error;
      setLead(data as unknown as LeadCenter);
    } catch (error: any) {
      console.error('Error fetching lead:', error);
      toast({
        title: "Error",
        description: "Failed to load lead details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLead = async (updates: Partial<LeadCenter>) => {
    try {
      const { error } = await supabase
        .from('lead_center' as any)
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead updated successfully",
      });

      fetchLead(); // Refresh lead
    } catch (error: any) {
      console.error('Error updating lead:', error);
      toast({
        title: "Error",
        description: "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  return {
    lead,
    isLoading,
    updateLead,
  };
};