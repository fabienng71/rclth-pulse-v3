
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Quotations from '../pages/Quotations';
import NewQuotation from '../pages/quotations/NewQuotation';
import QuotationView from '../pages/quotations/QuotationView';
import EditQuotation from '../pages/quotations/EditQuotation';

const QuotationsRoutes = (
  <>
    <Route path="/quotations" element={
      <ProtectedRoute>
        <Quotations />
      </ProtectedRoute>
    } />
    <Route path="/quotations/new" element={
      <ProtectedRoute>
        <NewQuotation />
      </ProtectedRoute>
    } />
    <Route path="/quotations/:id" element={
      <ProtectedRoute>
        <QuotationView />
      </ProtectedRoute>
    } />
    <Route path="/quotations/:id/edit" element={
      <ProtectedRoute>
        <EditQuotation />
      </ProtectedRoute>
    } />
  </>
);

export default QuotationsRoutes;
