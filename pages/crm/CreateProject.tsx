
import React from 'react';
import Navigation from '@/components/Navigation';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectFormSchema, type ProjectFormValues } from '@/components/crm/projects/schema';
import { ProjectFormFields } from '@/components/crm/projects/ProjectFormFields';
import { Button } from '@/components/ui/button';
import { useCreateProject } from '@/hooks/useCreateProject';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const navigate = useNavigate();
  const { createProject, isLoading } = useCreateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      is_active: true,
      target_type: 'PC',
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    await createProject(data);
    navigate('/crm/projects');
  };

  return (
    <>
      <Navigation />
      <main className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Create New Project</h1>
        </div>
        
        <div className="max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <ProjectFormFields />
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/crm/projects')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '📝 Creating Project...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </>
  );
};

export default CreateProject;
