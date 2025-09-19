
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ProjectFormValues } from '@/components/crm/projects/schema';
import { toast } from 'sonner';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // Prepare the data with required fields (dates are already strings)
      const formattedData = {
        title: data.title,
        description: data.description,
        is_active: data.is_active,
        start_date: data.start_date,
        end_date: data.end_date || null,
        vendor_code: data.vendor_code,
        vendor_name: data.vendor_name,
        target_type: data.target_type,
        target_value: data.target_value,
        status: 'Active', // Add default status
      };

      console.log('Creating project with data:', formattedData);

      // Direct insert to database
      const { error } = await supabase
        .from('project')
        .insert([formattedData]);
      
      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    },
  });

  return {
    createProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
};
