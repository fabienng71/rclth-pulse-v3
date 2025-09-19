
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useToggleClearanceCompletion = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      console.log('Toggling clearance completion:', id, is_done);

      const { error } = await supabase
        .from('clearance')
        .update({ is_done })
        .eq('uuid_id', id);
      
      if (error) {
        console.error('Error toggling clearance completion:', error);
        throw error;
      }
    },
    onSuccess: (_, { is_done }) => {
      queryClient.invalidateQueries({ queryKey: ['clearanceData'] });
      toast.success(`Item marked as ${is_done ? 'completed' : 'pending'}`);
    },
    onError: (error) => {
      console.error('Error toggling clearance completion:', error);
      toast.error('Failed to update item status');
    },
  });

  return {
    toggleCompletion: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
