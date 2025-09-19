
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createActivityFollowUpNotification } from '@/services/notificationService';

export interface ActivityFollowUp {
  id: string;
  activity_id: string;
  follow_up_note: string;
  follow_up_date: string;
  is_done: boolean;
  priority: 'low' | 'medium' | 'high';
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFollowUpData {
  activity_id: string;
  follow_up_note: string;
  follow_up_date: string;
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
}

export interface UpdateFollowUpData {
  follow_up_note?: string;
  follow_up_date?: string;
  is_done?: boolean;
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
}

export const useActivityFollowUps = (activityId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch follow-ups for an activity
  const { data: followUps = [], isLoading, error } = useQuery({
    queryKey: ['activity-follow-ups', activityId],
    queryFn: async () => {
      if (!activityId) return [];
      
      const { data, error } = await supabase
        .from('activity_follow_ups')
        .select('*')
        .eq('activity_id', activityId)
        .order('follow_up_date', { ascending: true });

      if (error) throw error;
      return data as ActivityFollowUp[];
    },
    enabled: !!activityId,
  });

  // Create follow-up mutation
  const createFollowUp = useMutation({
    mutationFn: async (followUpData: CreateFollowUpData) => {
      // Get the current user who is creating the follow-up
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication required to create follow-up');
      }

      // Create the follow-up
      const { data, error } = await supabase
        .from('activity_follow_ups')
        .insert({
          ...followUpData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the activity creator (non-blocking)
      // We don't wait for this to complete to avoid delaying the UI
      createActivityFollowUpNotification(
        followUpData.activity_id,
        followUpData.follow_up_note,
        user.id
      ).catch(notificationError => {
        console.warn('⚠️ Failed to create follow-up notification:', notificationError);
        // Don't fail the entire operation if notification fails
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-follow-ups', activityId] });
      toast({
        title: "Success",
        description: "Follow-up created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create follow-up: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update follow-up mutation
  const updateFollowUp = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFollowUpData }) => {
      const { data: result, error } = await supabase
        .from('activity_follow_ups')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-follow-ups', activityId] });
      toast({
        title: "Success",
        description: "Follow-up updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update follow-up: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete follow-up mutation
  const deleteFollowUp = useMutation({
    mutationFn: async (followUpId: string) => {
      const { error } = await supabase
        .from('activity_follow_ups')
        .delete()
        .eq('id', followUpId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-follow-ups', activityId] });
      toast({
        title: "Success",
        description: "Follow-up deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete follow-up: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Helper function to check if follow-up is overdue
  const isOverdue = (followUp: ActivityFollowUp) => {
    if (followUp.is_done) return false;
    const today = new Date();
    const followUpDate = new Date(followUp.follow_up_date);
    today.setHours(0, 0, 0, 0);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate < today;
  };

  // Get stats
  const stats = {
    total: followUps.length,
    completed: followUps.filter(f => f.is_done).length,
    pending: followUps.filter(f => !f.is_done).length,
    overdue: followUps.filter(f => isOverdue(f)).length,
  };

  return {
    followUps,
    isLoading,
    error,
    stats,
    createFollowUp: createFollowUp.mutate,
    updateFollowUp: updateFollowUp.mutate,
    deleteFollowUp: deleteFollowUp.mutate,
    isCreating: createFollowUp.isPending,
    isUpdating: updateFollowUp.isPending,
    isDeleting: deleteFollowUp.isPending,
    isOverdue,
  };
};
