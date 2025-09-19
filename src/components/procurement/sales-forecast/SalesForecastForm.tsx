
import React from 'react';
import { StartView, IndividualForecastView, CollaborativeForecastView } from './views';
import { useSalesForecastForm } from './hooks/useSalesForecastForm';

export const SalesForecastForm: React.FC = () => {
  const {
    viewMode,
    selectedVendor,
    selectedSession,
    collaborativeData,
    sessions,
    isAdmin,
    handleStartIndividual,
    handleSessionCreated,
    handleJoinSession,
    handleVendorSelect,
    handleReset,
    handleCollaborativeSave,
  } = useSalesForecastForm();

  // START VIEW - Choose between Individual or Collaborative + Management
  if (viewMode === 'start') {
    return (
      <StartView
        isAdmin={isAdmin}
        sessions={sessions}
        onStartIndividual={handleStartIndividual}
        onJoinSession={handleJoinSession}
        onSessionCreated={handleSessionCreated}
      />
    );
  }

  // INDIVIDUAL FORECAST VIEW - Vendor selection then items table
  if (viewMode === 'individual') {
    return (
      <IndividualForecastView
        selectedVendor={selectedVendor}
        onVendorSelect={handleVendorSelect}
        onReset={handleReset}
      />
    );
  }

  // COLLABORATIVE FORECAST VIEW - Session-based with vendor selection then items table
  if (viewMode === 'collaborative' && selectedSession) {
    return (
      <CollaborativeForecastView
        selectedSession={selectedSession}
        selectedVendor={selectedVendor}
        collaborativeData={collaborativeData}
        onVendorSelect={handleVendorSelect}
        onReset={handleReset}
        onSave={handleCollaborativeSave}
      />
    );
  }

  return null;
};
