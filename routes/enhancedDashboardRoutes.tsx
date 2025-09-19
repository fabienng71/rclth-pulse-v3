import React from 'react';
import { Route } from 'react-router-dom';
import EnhancedDashboard from '../pages/EnhancedDashboard';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const EnhancedDashboardRoutes = (
  <>
    {/* Enhanced Dashboard Route */}
    <Route 
      path="/dashboard/enhanced" 
      element={
        <ProtectedRoute>
          <EnhancedDashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* Original Dashboard Route (for backward compatibility) */}
    <Route 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } 
    />
    
    {/* Default redirect to enhanced dashboard */}
    <Route 
      path="/dashboard/default" 
      element={
        <ProtectedRoute>
          <EnhancedDashboard />
        </ProtectedRoute>
      } 
    />
  </>
);

// Add logging to help debug route loading issues
console.log('Enhanced Dashboard Routes loaded and configured');

export default EnhancedDashboardRoutes;