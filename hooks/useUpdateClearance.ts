
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClearanceFormValues } from '@/components/crm/clearance/schema';
import { toast } from 'sonner';

interface UpdateClearanceParams extends ClearanceFormValues {
  id: string; // Changed from number to string for UUID
}

export const useUpdateClearance = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateClearanceParams) => {
      const { id, ...formData } = data;
      console.log('Updating clearance item with data:', formData);

      const { error } = await supabase
        .from('clearance')
        .update({
          item_code: formData.item_code,
          description: formData.description,
          quantity: formData.quantity,
          expiration_date: formData.expiration_date,
          note: formData.note,
          clearance_price: formData.clearance_price,
          uom: formData.uom,
        })
        .eq('uuid_id', id); // Use uuid_id instead of id
      
      if (error) {
        console.error('Error updating clearance item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clearanceData'] });
      toast.success('Clearance item updated successfully');
    },
    onError: (error) => {
      console.error('Error updating clearance item:', error);
      toast.error('Failed to update clearance item');
    },
  });

  return {
    updateClearance: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
