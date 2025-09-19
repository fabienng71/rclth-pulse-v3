
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import Login from '../pages/Login';
import Index from '../pages/Index';
import DiagnosticPage from '../pages/DiagnosticPage';
import DashboardRoutes from './dashboardRoutes';
import ReportsRoutes from './reportsRoutes';
import FormsRoutes from './formsRoutes';
import QuotationsRoutes from './quotationsRoutes';
import CrmRoutes from './crmRoutes';
import MarketingRoutes from './marketingRoutes';
import ProcurementRoutes from './procurementRoutes';
import AdminRoutes from './adminRoutes';
import UserProfile from '../pages/UserProfile';
import ReportingDashboard from '../pages/reporting/ReportingDashboard';
import SQLQueries from '../pages/SQLQueries';

const AppRoutes = () => {
  console.log('=== ROUTES: Rendering AppRoutes component ===');
  
  try {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        
        {/* Diagnostic page for troubleshooting */}
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        
        {/* User profile route */}
        <Route path="/profile" element={<UserProfile />} />
        
        {/* Special pages - only accessible by fabien@repertoire.co.th */}
        <Route path="/reporting" element={<ReportingDashboard />} />
        <Route path="/sql-queries" element={<SQLQueries />} />
        
        {/* Module routes */}
        {DashboardRoutes}
        {ReportsRoutes}
        {QuotationsRoutes}
        {FormsRoutes}
        {CrmRoutes}
        {MarketingRoutes}
        {ProcurementRoutes}
        
        {/* Admin routes */}
        {AdminRoutes}
        
        {/* Catch all - NotFound */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  } catch (error) {
    console.error('=== ROUTES: Error rendering routes ===', error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6">
          <h1 className="text-xl font-bold text-red-600 mb-4">Navigation Error</h1>
          <p className="text-gray-700 mb-4">Unable to load application routes.</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/'} 
              className="block mx-auto px-4 py-2 bg-blue-500 text-white rounded"
            >
              Go to Home
            </button>
            <button 
              onClick={() => window.location.href = '/diagnostic'} 
              className="block mx-auto px-4 py-2 bg-gray-500 text-white rounded"
            >
              Run Diagnostics
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default AppRoutes;
