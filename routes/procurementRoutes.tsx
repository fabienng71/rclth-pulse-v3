import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import ProcurementDashboard from '../pages/procurement/ProcurementDashboard';
import ShipmentListPage from '../pages/procurement/ShipmentListPage';
import CreateShipmentPage from '../pages/procurement/CreateShipmentPage';
import CreateClaimPage from '../pages/procurement/CreateClaimPage';
import CreateForecastPage from '../pages/procurement/CreateForecastPage';
import CreateSalesForecastPage from '../pages/procurement/CreateSalesForecastPage';
import ForecastListPage from '../pages/procurement/ForecastListPage';
import ForecastDetailPage from '../pages/procurement/ForecastDetailPage';
import ShipmentDetailsPage from '../pages/procurement/ShipmentDetailsPage';
import IncomingStockSummaryPage from '../pages/procurement/IncomingStockSummaryPage';
import ShipmentTimelinePage from '../pages/procurement/ShipmentTimelinePage';
import ShipmentTodoPage from '../components/procurement/shipment-todo/ShipmentTodoPage';
import SalesForecastListPage from '../pages/procurement/SalesForecastListPage';

const ProcurementRoutes = (
  <>
    <Route path="/procurement" element={
      <ProtectedRoute>
        <ProcurementDashboard />
      </ProtectedRoute>
    } />
    <Route path="/procurement/shipments" element={
      <ProtectedRoute>
        <ShipmentListPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/shipments/timeline" element={
      <ProtectedRoute>
        <ShipmentTimelinePage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/shipments/:id/todo" element={
      <ProtectedRoute>
        <ShipmentTodoPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/incoming-stock" element={
      <ProtectedRoute>
        <IncomingStockSummaryPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/create" element={
      <ProtectedRoute>
        <CreateShipmentPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/claim/create" element={
      <ProtectedRoute>
        <CreateClaimPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/forecast/create" element={
      <ProtectedRoute>
        <CreateForecastPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/create-sales-forecast" element={
      <ProtectedRoute>
        <CreateSalesForecastPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/forecasts" element={
      <ProtectedRoute>
        <ForecastListPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/forecasts/:id" element={
      <ProtectedRoute>
        <ForecastDetailPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/:id" element={
      <ProtectedRoute>
        <ShipmentDetailsPage />
      </ProtectedRoute>
    } />
    <Route path="/procurement/sales-forecasts" element={
      <ProtectedRoute>
        <SalesForecastListPage />
      </ProtectedRoute>
    } />
  </>
);

export default ProcurementRoutes;
