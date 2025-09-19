
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProjectFormValues } from '@/components/crm/projects/schema';
import { toast } from 'sonner';

interface UpdateProjectParams extends ProjectFormValues {
  id: string;
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateProjectParams) => {
      const { id, ...formData } = data;

      // Prepare the data (dates are already strings)
      const formattedData = {
        title: formData.title,
        description: formData.description,
        is_active: formData.is_active,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        vendor_code: formData.vendor_code,
        vendor_name: formData.vendor_name,
        target_type: formData.target_type,
        target_value: formData.target_value,
      };

      console.log('Updating project with data:', formattedData);

      // Direct update to database
      const { error } = await supabase
        .from('project')
        .update(formattedData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    },
  });

  return {
    updateProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
