
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import Projects from '../../pages/crm/Projects';
import CreateProject from '../../pages/crm/CreateProject';
import EditProject from '../../pages/crm/EditProject';
import ProjectDetails from '../../pages/crm/ProjectDetails';

const ProjectRoutes = (
  <>
    {/* Projects routes */}
    <Route path="/crm/projects" element={
      <ProtectedRoute>
        <Projects />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/projects/create" element={
      <ProtectedRoute>
        <CreateProject />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/projects/:id/edit" element={
      <ProtectedRoute>
        <EditProject />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/projects/:id" element={
      <ProtectedRoute>
        <ProjectDetails />
      </ProtectedRoute>
    } />
  </>
);

export default ProjectRoutes;
