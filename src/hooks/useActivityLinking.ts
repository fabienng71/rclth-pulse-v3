
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface LinkedActivity {
  id: string;
  activity_type: string;
  activity_date: string;
  customer_name?: string;
  contact_name?: string;
  salesperson_name?: string;
  status?: string;
  notes?: string;
}

interface Activity extends LinkedActivity {
  lead_center_id?: string | null;
}

export const useActivityLinking = (leadId: string) => {
  const [linkedActivities, setLinkedActivities] = useState<LinkedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLinkedActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, activity_type, activity_date, customer_name, contact_name, salesperson_name, status, notes')
        .eq('lead_center_id', leadId);

      if (error) {
        console.error('Error fetching linked activities:', error);
        throw error;
      }

      setLinkedActivities(data || []);
    } catch (error) {
      console.error('Error fetching linked activities:', error);
      toast({
        title: "Error",
        description: "Failed to load linked activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [leadId, toast]);

  const linkActivities = useCallback(async (activityIds: string[]) => {
    try {
      // Update activities to link them to this lead by setting lead_center_id
      const { error: updateError } = await supabase
        .from('activities')
        .update({ lead_center_id: leadId })
        .in('id', activityIds);

      if (updateError) {
        console.error('Error linking activities:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: `${activityIds.length} ${activityIds.length === 1 ? 'activity' : 'activities'} linked successfully`,
      });

      fetchLinkedActivities();
    } catch (error) {
      console.error('Error linking activities:', error);
      toast({
        title: "Error",
        description: "Failed to link activities",
        variant: "destructive",
      });
    }
  }, [leadId, toast, fetchLinkedActivities]);

  const unlinkActivity = useCallback(async (activityId: string) => {
    try {
      // Unlink activity by removing the lead_center_id
      const { error: updateError } = await supabase
        .from('activities')
        .update({ lead_center_id: null })
        .eq('id', activityId);

      if (updateError) {
        console.error('Error unlinking activity:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Activity unlinked successfully",
      });

      fetchLinkedActivities();
    } catch (error) {
      console.error('Error unlinking activity:', error);
      toast({
        title: "Error",
        description: "Failed to unlink activity",
        variant: "destructive",
      });
    }
  }, [toast, fetchLinkedActivities]);

  useEffect(() => {
    if (leadId) {
      fetchLinkedActivities();
    }
  }, [leadId, fetchLinkedActivities]);

  return {
    linkedActivities,
    isLoading,
    linkActivities,
    unlinkActivity,
    refetch: fetchLinkedActivities
  };
};
