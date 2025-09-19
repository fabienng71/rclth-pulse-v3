
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Control, FieldValues } from 'react-hook-form';

interface ProjectSelectFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>;
}

export const ProjectSelectField = <T extends FieldValues = FieldValues>({ control }: ProjectSelectFieldProps<T>) => {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('project')
          .select('id, title')
          .eq('is_active', true)
          .order('title');
        
        if (error) {
          // Handle 406 errors which indicate missing table or columns
          if (error.message?.includes('406') || error.code === 'PGRST116') {
            console.warn('Project table not available or columns missing:', error);
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error: unknown) {
        console.error('Error fetching projects:', error);
        // Return empty array for missing table instead of throwing
        if ((error as Error).message?.includes('406') || (error as Error).message?.includes('Not Acceptable')) {
          console.warn('Project table appears to be unavailable, returning empty projects list');
          return [];
        }
        throw error;
      }
    },
    retry: false, // Don't retry for 406 errors
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <FormField
      control={control}
      name="project_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Project</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || 'none'}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {isLoading && (
                <SelectItem value="loading">Loading projects...</SelectItem>
              )}
              {error && (
                <SelectItem value="error">Project system unavailable</SelectItem>
              )}
              {!isLoading && !error && (!projects || projects.length === 0) && (
                <SelectItem value="no-projects">No projects available</SelectItem>
              )}
              {!isLoading && !error && projects && projects.length > 0 && projects.map((project) => {
                // Ensure we have valid values for id and title
                const id = project.id || `project-${Math.random().toString(36).substring(7)}`;
                const title = project.title || "Unnamed Project";
                
                return (
                  <SelectItem key={id} value={id}>
                    {title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
