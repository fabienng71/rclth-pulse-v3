
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import FormsIndex from '../pages/forms/FormsIndex';
import ReturnForm from '../pages/forms/ReturnForm';
import ReturnFormSubmit from '../pages/forms/ReturnFormSubmit';
import ReturnFormEdit from '../pages/forms/ReturnFormEdit';
import ReturnRequestView from '../pages/forms/ReturnRequestView';
import SampleRequestList from '../pages/forms/SampleRequestList';
import SampleForm from '../pages/forms/SampleForm';
import SampleRequestEdit from '../pages/forms/SampleRequestEdit';
import SampleRequestView from '../pages/forms/SampleRequestView';
import SampleRequestCreate from '../pages/forms/SampleRequestCreate';
import EnhancedSampleRequestList from '../pages/forms/EnhancedSampleRequestList';
import LeaveDashboard from '../pages/leave/LeaveDashboard';
import CustomerRequestsList from '../pages/forms/CustomerRequestsList';
import CustomerRequestForm from '../pages/forms/CustomerRequestForm';
import CustomerRequestView from '../pages/forms/CustomerRequestView';
import CustomerRequestEdit from '../pages/forms/CustomerRequestEdit';
import WriteoffRequestsList from '../pages/forms/WriteoffRequestsList';
import WriteoffRequestCreate from '../pages/forms/WriteoffRequestCreate';
import WriteoffRequestView from '../pages/forms/WriteoffRequestView';
import AdjustmentRequestsList from '../pages/forms/AdjustmentRequestsList';
import AdjustmentRequestCreate from '../pages/forms/AdjustmentRequestCreate';
import AdjustmentRequestView from '../pages/forms/AdjustmentRequestView';

const FormsRoutes = (
  <>
    <Route path="/forms" element={
      <ProtectedRoute>
        <FormsIndex />
      </ProtectedRoute>
    } />
    {/* New Leave Management System */}
    <Route path="/forms/leave-management" element={
      <ProtectedRoute>
        <LeaveDashboard />
      </ProtectedRoute>
    } />
    {/* Return request routes */}
    <Route path="/forms/return" element={
      <ProtectedRoute>
        <ReturnForm />
      </ProtectedRoute>
    } />
    <Route path="/forms/return/submit" element={
      <ProtectedRoute>
        <ReturnFormSubmit />
      </ProtectedRoute>
    } />
    <Route path="/forms/return/edit/:id" element={
      <ProtectedRoute>
        <ReturnFormEdit />
      </ProtectedRoute>
    } />
    <Route path="/forms/return/view/:id" element={
      <ProtectedRoute>
        <ReturnRequestView />
      </ProtectedRoute>
    } />
    {/* Sample request routes - Enhanced */}
    <Route path="/forms/sample" element={
      <ProtectedRoute>
        <EnhancedSampleRequestList />
      </ProtectedRoute>
    } />
    <Route path="/forms/sample/create" element={
      <ProtectedRoute>
        <SampleRequestCreate />
      </ProtectedRoute>
    } />
    <Route path="/forms/sample/edit/:id" element={
      <ProtectedRoute>
        <SampleRequestEdit />
      </ProtectedRoute>
    } />
    <Route path="/forms/sample/view/:id" element={
      <ProtectedRoute>
        <SampleRequestView />
      </ProtectedRoute>
    } />
    {/* Legacy sample request routes */}
    <Route path="/forms/sample-legacy" element={
      <ProtectedRoute>
        <SampleRequestList />
      </ProtectedRoute>
    } />
    <Route path="/forms/sample-legacy/create" element={
      <ProtectedRoute>
        <SampleForm />
      </ProtectedRoute>
    } />
    {/* Customer maintenance request routes */}
    <Route path="/forms/customer" element={
      <ProtectedRoute>
        <CustomerRequestsList />
      </ProtectedRoute>
    } />
    <Route path="/forms/customer/create" element={
      <ProtectedRoute>
        <CustomerRequestForm />
      </ProtectedRoute>
    } />
    <Route path="/forms/customer/edit/:id" element={
      <ProtectedRoute>
        <CustomerRequestEdit />
      </ProtectedRoute>
    } />
    <Route path="/forms/customer/view/:id" element={
      <ProtectedRoute>
        <CustomerRequestView />
      </ProtectedRoute>
    } />
    {/* Write-off request routes */}
    <Route path="/forms/writeoff" element={
      <ProtectedRoute>
        <WriteoffRequestsList />
      </ProtectedRoute>
    } />
    <Route path="/forms/writeoff/create" element={
      <ProtectedRoute>
        <WriteoffRequestCreate />
      </ProtectedRoute>
    } />
    <Route path="/forms/writeoff/view/:id" element={
      <ProtectedRoute>
        <WriteoffRequestView />
      </ProtectedRoute>
    } />
    {/* Adjustment request routes */}
    <Route path="/forms/adjustment" element={
      <ProtectedRoute>
        <AdjustmentRequestsList />
      </ProtectedRoute>
    } />
    <Route path="/forms/adjustment/create" element={
      <ProtectedRoute>
        <AdjustmentRequestCreate />
      </ProtectedRoute>
    } />
    <Route path="/forms/adjustment/view/:id" element={
      <ProtectedRoute>
        <AdjustmentRequestView />
      </ProtectedRoute>
    } />
  </>
);

export default FormsRoutes;
