
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import EnhancedDashboard from '../pages/EnhancedDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const DashboardRoutes = (
  <>
    {/* Original Dashboard - Now the default */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* Enhanced Dashboard - Temporarily disabled due to missing components */}
    <Route 
      path="/dashboard/enhanced" 
      element={
        <ProtectedRoute>
          <EnhancedDashboard />
        </ProtectedRoute>
      } 
    />
  </>
);

// Add logging to help debug route loading issues
console.log('DashboardRoutes loaded and configured with Original Dashboard as default');

export default DashboardRoutes;
