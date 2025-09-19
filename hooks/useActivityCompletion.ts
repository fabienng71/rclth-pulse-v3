
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ToggleCompletionParams {
  id: string;
  isCompleted: boolean;
}

export const useActivityCompletion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleCompletion = useMutation({
    mutationFn: async ({ id, isCompleted }: ToggleCompletionParams) => {
      const updateData = {
        is_done: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch activities data
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      
      toast({
        title: "Success",
        description: `Activity ${variables.isCompleted ? 'completed' : 'reopened'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update activity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const bulkToggleCompletion = useMutation({
    mutationFn: async ({ ids, isCompleted }: { ids: string[], isCompleted: boolean }) => {
      const updateData = {
        is_done: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .in('id', ids)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      
      toast({
        title: "Success",
        description: `${data.length} activities ${variables.isCompleted ? 'completed' : 'reopened'} successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update activities: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    toggleCompletion: toggleCompletion.mutate,
    bulkToggleCompletion: bulkToggleCompletion.mutate,
    isToggling: toggleCompletion.isPending || bulkToggleCompletion.isPending,
  };
};
