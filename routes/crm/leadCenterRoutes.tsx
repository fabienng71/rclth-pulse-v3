import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import LeadCenterDashboard from '../../pages/crm/LeadCenterDashboard';
import LeadCenterCreate from '../../pages/crm/LeadCenterCreate';
import LeadCenterManagement from '../../pages/crm/LeadCenterManagement';
import LeadCenterEdit from '../../pages/crm/LeadCenterEdit';

const LeadCenterRoutes = (
  <>
    <Route path="/crm/lead-center" element={
      <ProtectedRoute>
        <LeadCenterDashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/lead-center/list" element={
      <ProtectedRoute>
        <LeadCenterDashboard />
      </ProtectedRoute>
    } />

    <Route path="/crm/lead-center/create" element={
      <ProtectedRoute>
        <LeadCenterCreate />
      </ProtectedRoute>
    } />

    <Route path="/crm/lead-center/:id" element={
      <ProtectedRoute>
        <LeadCenterManagement />
      </ProtectedRoute>
    } />

    <Route path="/crm/lead-center/:id/edit" element={
      <ProtectedRoute>
        <LeadCenterEdit />
      </ProtectedRoute>
    } />
  </>
);

export default LeadCenterRoutes;