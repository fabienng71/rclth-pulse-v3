
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import StockOnHand from '../../pages/marketing/StockOnHand';
import Clearance from '../../pages/crm/Clearance';

const UtilityRoutes = (
  <>
    {/* Stock on Hand route (moved from marketing) */}
    <Route path="/crm/stock-on-hand" element={
      <ProtectedRoute>
        <StockOnHand />
      </ProtectedRoute>
    } />

    {/* Clearance route (new) */}
    <Route path="/crm/clearance" element={
      <ProtectedRoute>
        <Clearance />
      </ProtectedRoute>
    } />
  </>
);

export default UtilityRoutes;
