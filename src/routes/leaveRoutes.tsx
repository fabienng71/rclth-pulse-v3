import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import LeaveDashboard from '@/pages/leave/LeaveDashboard';

export const leaveRoutes = (
  <>
    <Route
      path="/leave"
      element={
        <ProtectedRoute>
          <LeaveDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/leave/dashboard"
      element={
        <ProtectedRoute>
          <LeaveDashboard />
        </ProtectedRoute>
      }
    />
  </>
);