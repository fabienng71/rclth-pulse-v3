import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchema, type ProjectFormValues } from '@/components/crm/projects/schema';
import { ProjectFormFields } from '@/components/crm/projects/ProjectFormFields';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { useUpdateProject } from '@/hooks/useUpdateProject';
import { useProjectDetails } from '@/hooks/useProjectDetails';
import { ArrowLeft } from 'lucide-react';

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, isLoading: isLoadingProject } = useProjectDetails(id);
  const { updateProject, isLoading: isUpdating } = useUpdateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      is_active: true,
      target_type: 'PC',
    },
  });

  useEffect(() => {
    if (project) {
      console.log('Setting form values with project:', project);
      
      // Keep dates as strings instead of converting to Date objects
      form.reset({
        title: project.title,
        description: project.description || '',
        is_active: project.is_active,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        vendor_code: project.vendor_code || '',
        vendor_name: project.vendor_name || '', 
        target_type: project.target_type,
        target_value: project.target_value || 0,
      });
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectFormValues) => {
    if (!id) return;
    
    await updateProject({ id, ...data });
    navigate('/crm/projects');
  };

  if (isLoadingProject) {
    return (
      <>
        <Navigation />
        <main className="container py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold md:text-3xl">Edit Project</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-lg text-muted-foreground">Loading project details...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/crm/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Edit Project</h1>
        </div>
        
        <div className="max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ProjectFormFields activities={project?.activities} isEdit={true} />
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/crm/projects')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? '📝 Updating Project...' : 'Update Project'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </>
  );
};

export default EditProject;
