
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateFollowupStatusParams {
  id: string;
  pipeline_stage: string;
}

export const useFollowupUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatus = useMutation({
    mutationFn: async ({ id, pipeline_stage }: UpdateFollowupStatusParams) => {
      const { data, error } = await supabase
        .from('activities')
        .update({ pipeline_stage })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch followups data
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast({
        title: "Success",
        description: "Follow-up pipeline stage updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update pipeline stage: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    updateStatus: updateStatus.mutate,
    isUpdating: updateStatus.isPending,
  };
};
