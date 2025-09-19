
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useDeleteClearance = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => { // Changed from number to string for UUID
      console.log('Deleting clearance item with id:', id);

      const { error } = await supabase
        .from('clearance')
        .delete()
        .eq('uuid_id', id); // Use uuid_id instead of id
      
      if (error) {
        console.error('Error deleting clearance item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clearanceData'] });
      toast.success('Clearance item deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting clearance item:', error);
      toast.error('Failed to delete clearance item');
    },
  });

  return {
    deleteClearance: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
