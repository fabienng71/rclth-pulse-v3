
import React from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectCard } from '@/components/crm/projects/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const Projects = () => {
  const navigate = useNavigate();
  const { projects, isLoading, error } = useProjects();
  // Get admin status from auth store
  const isAdmin = useAuthStore((state) => state.isAdmin);

  return (
    <>
      <Navigation />
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Projects</h1>
          <Button onClick={() => navigate('/crm/projects/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">Error loading projects: {error.message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-muted-foreground mb-4">No projects found</p>
            <Button onClick={() => navigate('/crm/projects/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create your first project
            </Button>
          </div>
        )}
      </main>
    </>
  );
};

export default Projects;
