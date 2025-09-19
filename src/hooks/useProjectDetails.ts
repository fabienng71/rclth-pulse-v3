
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Project } from '@/hooks/useProjects';

export const useProjectDetails = (id?: string) => {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      
      // First, get the project details
      const { data: projectData, error: projectError } = await supabase
        .from('project')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      
      // Then, count activities related to this project
      const { count, error: activitiesError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', id);
        
      if (activitiesError) console.error('Error counting activities:', activitiesError);
      
      // Combine the data
      return {
        ...projectData,
        activities: count?.toString() || '0'
      } as Project;
    },
    enabled: !!id,
  });

  return {
    project,
    isLoading,
    error,
  };
};
