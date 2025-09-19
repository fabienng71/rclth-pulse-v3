
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ClearanceFormValues } from '@/components/crm/clearance/schema';
import { toast } from 'sonner';

export const useCreateClearance = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ClearanceFormValues) => {
      console.log('Creating clearance item with data:', data);

      const { error } = await supabase
        .from('clearance')
        .insert([{
          item_code: data.item_code,
          description: data.description,
          quantity: data.quantity,
          expiration_date: data.expiration_date,
          note: data.note,
          clearance_price: data.clearance_price,
          uom: data.uom,
        }]);
      
      if (error) {
        console.error('Error creating clearance item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clearanceData'] });
      toast.success('Clearance item created successfully');
    },
    onError: (error) => {
      console.error('Error creating clearance item:', error);
      toast.error('Failed to create clearance item');
    },
  });

  return {
    createClearance: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
