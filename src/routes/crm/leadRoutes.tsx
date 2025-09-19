
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import CreateLead from '../../pages/crm/CreateLead';
import Leads from '../../pages/crm/Leads';
import LeadAIResearch from '../../pages/crm/LeadAIResearch';

const LeadRoutes = (
  <>
    {/* Leads routes */}
    <Route path="/crm/leads" element={
      <ProtectedRoute>
        <Leads />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/leads/create" element={
      <ProtectedRoute>
        <CreateLead />
      </ProtectedRoute>
    } />
    
    {/* Add route for individual lead viewing/editing */}
    <Route path="/crm/leads/:id" element={
      <ProtectedRoute>
        <CreateLead />
      </ProtectedRoute>
    } />
    
    {/* Add route for editing a lead specifically */}
    <Route path="/crm/leads/:id/edit" element={
      <ProtectedRoute>
        <CreateLead />
      </ProtectedRoute>
    } />
    
    {/* Add route for AI Research panel for individual lead */}
    <Route path="/crm/leads/:id/ai-research" element={
      <ProtectedRoute>
        <React.Suspense fallback={<div>Loading...</div>}>
          <LeadAIResearch />
        </React.Suspense>
      </ProtectedRoute>
    } />
  </>
);

export default LeadRoutes;
