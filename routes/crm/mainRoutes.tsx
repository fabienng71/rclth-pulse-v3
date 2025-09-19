import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import CRM from '../../pages/CRM';
import CRMDashboard from '../../pages/crm/CRMDashboard';
import CRMAnalytics from '../../pages/crm/CRMAnalytics';
import NotificationsPage from '../../pages/crm/NotificationsPage';
import NotificationDebug from '../../pages/NotificationDebug';
import CustomersList from '../../pages/crm/CustomersList';
import CreateCustomer from '../../pages/crm/CreateCustomer';

const MainCrmRoutes = (
  <>
    {/* CRM main route - now points directly to dashboard */}
    <Route path="/crm" element={
      <ProtectedRoute>
        <CRMDashboard />
      </ProtectedRoute>
    } />
    
    {/* CRM Dashboard route - keep for backward compatibility */}
    <Route path="/crm/dashboard" element={
      <ProtectedRoute>
        <CRMDashboard />
      </ProtectedRoute>
    } />

    {/* CRM Analytics route */}
    <Route path="/crm/analytics" element={
      <ProtectedRoute>
        <CRMAnalytics />
      </ProtectedRoute>
    } />

    {/* CRM Customers routes */}
    <Route path="/crm/customers" element={
      <ProtectedRoute>
        <CustomersList />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/customers/create" element={
      <ProtectedRoute>
        <CreateCustomer />
      </ProtectedRoute>
    } />
    
    <Route path="/crm/customers/:id/edit" element={
      <ProtectedRoute>
        <CreateCustomer />
      </ProtectedRoute>
    } />

    {/* CRM Overview route - keep the original card-based page available */}
    <Route path="/crm/overview" element={
      <ProtectedRoute>
        <CRM />
      </ProtectedRoute>
    } />

    {/* Notifications route */}
    <Route path="/crm/notifications" element={
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    } />
    
    {/* Notification Debug route */}
    <Route path="/crm/debug/notifications" element={
      <ProtectedRoute>
        <NotificationDebug />
      </ProtectedRoute>
    } />
  </>
);

export default MainCrmRoutes;
