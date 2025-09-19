
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ActivityForm from '../../pages/crm/ActivityForm';
import ActivityList from '../../pages/crm/ActivityList';
import ActivityPipelinePage from '../../pages/crm/ActivityPipelinePage';
import FollowupsList from '../../pages/crm/FollowupsList';

const ActivityRoutes = (
  <>
    {/* Activities routes - order matters! Specific routes first, then parameter routes */}
    <Route path="/crm/activities/new" element={
      <ProtectedRoute>
        <ActivityForm />
      </ProtectedRoute>
    } />

    <Route path="/crm/activity/new" element={
      <ProtectedRoute>
        <ActivityForm />
      </ProtectedRoute>
    } />

    <Route path="/crm/activity/followups" element={
      <ProtectedRoute>
        <FollowupsList />
      </ProtectedRoute>
    } />

    {/* Activity Pipeline route - must come before :id route */}
    <Route path="/crm/activities/pipeline/:activityId" element={
      <ProtectedRoute>
        <ActivityPipelinePage />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/activity/:id" element={
      <ProtectedRoute>
        <ActivityForm />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/activity" element={
      <ProtectedRoute>
        <ActivityList />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/activities" element={
      <ProtectedRoute>
        <ActivityList />
      </ProtectedRoute>
    } />

    {/* Add direct Follow-ups route */}
    <Route path="/crm/followups" element={
      <ProtectedRoute>
        <FollowupsList />
      </ProtectedRoute>
    } />
  </>
);

export default ActivityRoutes;
