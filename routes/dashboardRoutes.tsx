
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import EnhancedDashboard from '../pages/EnhancedDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const DashboardRoutes = (
  <>
    {/* Enhanced Dashboard - Now the default */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <EnhancedDashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* Original Dashboard - For comparison/fallback */}
    <Route 
      path="/dashboard/original" 
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } 
    />
  </>
);

// Add logging to help debug route loading issues
console.log('DashboardRoutes loaded and configured with Enhanced Dashboard as default');

export default DashboardRoutes;
