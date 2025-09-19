import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AppInitializer } from './components/AppInitializer';
import ProtectedRoute from './components/ProtectedRoute';
import { PermissionProvider } from './contexts/PermissionContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import SQLQueries from './pages/SQLQueries';
import NotificationDebug from './pages/NotificationDebug';
import FormsRoutes from './routes/formsRoutes';
import CRMRoutes from './routes/crmRoutes';
import AdminRoutes from './routes/adminRoutes';
import ReportsRoutes from './routes/reportsRoutes';
import QuotationsRoutes from './routes/quotationsRoutes';
import ProcurementRoutes from './routes/procurementRoutes';
import MarketingRoutes from './routes/marketingRoutes';
import DashboardRoutes from './routes/dashboardRoutes';
import SyncLogs from './pages/admin/SyncLogs';
import { AppLayout } from './components/layout/AppLayout';
import { usePlatformFontOptimization } from './hooks/usePlatformFontOptimization';

function App() {
  // Apply platform-specific font optimizations
  usePlatformFontOptimization();
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="app-theme"
    >
      <AppInitializer />
      <PermissionProvider>
        <Router>
          <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard routes */}
            {DashboardRoutes}
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/sql" element={
              <ProtectedRoute>
                <SQLQueries />
              </ProtectedRoute>
            } />
            <Route path="/debug/notifications" element={
              <ProtectedRoute>
                <NotificationDebug />
              </ProtectedRoute>
            } />
            
            {/* Reports routes */}
            {ReportsRoutes}
            
            {/* Quotations routes */}
            {QuotationsRoutes}
            
            {/* Procurement routes */}
            {ProcurementRoutes}
            
            {/* Marketing routes */}
            {MarketingRoutes}
            
            {/* Form routes */}
            {FormsRoutes}
            
            {/* CRM routes */}
            {CRMRoutes}
            
            {/* Admin routes - PROTECTED */}
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin={true}>
                <Routes>
                  {AdminRoutes}
                  <Route path="sync-logs" element={<SyncLogs />} />
                </Routes>
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </AppLayout>
        </Router>
      </PermissionProvider>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
