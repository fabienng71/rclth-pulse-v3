
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import ContactsList from '../../pages/crm/ContactsList';
import CreateContact from '../../pages/crm/CreateContact';
import { ContactDetailPage } from '../../components/crm/contacts/ContactDetailPage';
import { ContactTagsProvider } from '../../contexts/ContactTagsContext';

const ContactRoutes = (
  <>
    {/* Contacts routes */}
    <Route path="/crm/contacts" element={
      <ProtectedRoute>
        <ContactsList />
      </ProtectedRoute>
    } />
    
    {/* Contact creation route - must come before :id route */}
    <Route path="/crm/contacts/create" element={
      <ProtectedRoute>
        <CreateContact />
      </ProtectedRoute>
    } />
    
    {/* Add route for editing a contact specifically - must come before :id route */}
    <Route path="/crm/contacts/:id/edit" element={
      <ProtectedRoute>
        <CreateContact />
      </ProtectedRoute>
    } />
    
    {/* Contact detail page - new comprehensive view - must come after specific routes */}
    <Route path="/crm/contacts/:id" element={
      <ProtectedRoute>
        <ContactTagsProvider>
          <div className="container py-6 max-w-7xl mx-auto px-4 sm:px-6">
            <ContactDetailPage />
          </div>
        </ContactTagsProvider>
      </ProtectedRoute>
    } />
  </>
);

export default ContactRoutes;
