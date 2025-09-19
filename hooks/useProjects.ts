
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Project {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  forced_active?: boolean;
  archive?: boolean;
  start_date: string;
  vendor_code?: string;
  vendor_name?: string;
  target_type: 'PC' | 'KG' | 'Amount';
  activities: string;
  target_value: number;
  status: string;
  created_at: string;
  updated_at: string;
  budget?: number;
  customer_code?: string;
  end_date?: string;
  salesperson_id?: string;
}

export const useProjects = () => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // First, get all projects
      const { data, error } = await supabase
        .from('project')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each project, count the related activities and check end date
      const projectsWithActivities = await Promise.all(
        data.map(async (project) => {
          const { count, error: activitiesError } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);
            
          if (activitiesError) console.error('Error counting activities:', activitiesError);
          
          // Check if end date has been reached
          const endDate = project.end_date ? new Date(project.end_date) : null;
          const isExpired = endDate ? endDate < new Date() : false;
          
          // Only deactivate if expired AND not forced active
          if (isExpired && project.is_active && !project.forced_active) {
            const { error: updateError } = await supabase
              .from('project')
              .update({ is_active: false })
              .eq('id', project.id);
              
            if (updateError) console.error('Error updating project status:', updateError);
            project.is_active = false;
          }
          
          return {
            ...project,
            activities: count?.toString() || '0'
          };
        })
      );

      return projectsWithActivities as Project[];
    },
  });

  return {
    projects,
    isLoading,
    error,
  };
};
