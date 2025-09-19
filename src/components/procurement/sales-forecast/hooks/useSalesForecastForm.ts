import { useState, useCallback } from 'react';
import { useForecastSessions } from '@/hooks/useForecastSessions';
import { useSalesForecastManagement } from '@/hooks/useSalesForecastManagement';
import { useAuthStore } from '@/stores/authStore';

interface SelectedVendor {
  vendor_code: string;
  vendor_name: string;
}

type ViewMode = 'start' | 'individual' | 'collaborative';

export const useSalesForecastForm = () => {
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('start');
  const [selectedVendor, setSelectedVendor] = useState<SelectedVendor | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [collaborativeData, setCollaborativeData] = useState<any[]>([]);
  
  const { sessions, getCollaborativeData, fetchSessions } = useForecastSessions();
  const { isAdmin } = useSalesForecastManagement();

  const handleStartIndividual = useCallback(() => {
    setViewMode('individual');
    setSelectedVendor(null);
    setSelectedSessionId(null);
    setCollaborativeData([]);
  }, []);

  const handleSessionCreated = useCallback(async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setViewMode('collaborative');
    setSelectedVendor(null);
    
    // Load collaborative data
    const data = await getCollaborativeData(sessionId);
    setCollaborativeData(data);
  }, [getCollaborativeData]);

  const handleJoinSession = useCallback(async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setViewMode('collaborative');
    setSelectedVendor(null);
    
    // Load collaborative data
    const data = await getCollaborativeData(sessionId);
    setCollaborativeData(data);
  }, [getCollaborativeData]);

  const handleVendorSelect = useCallback((vendor: SelectedVendor) => {
    setSelectedVendor(vendor);
  }, []);

  const handleReset = useCallback(() => {
    setViewMode('start');
    setSelectedVendor(null);
    setSelectedSessionId(null);
    setCollaborativeData([]);
  }, []);

  const handleCollaborativeSave = useCallback(async () => {
    if (selectedSessionId) {
      const data = await getCollaborativeData(selectedSessionId);
      setCollaborativeData(data);
    }
  }, [selectedSessionId, getCollaborativeData]);

  const handleSessionDeleted = useCallback(() => {
    fetchSessions();
    handleReset();
  }, [fetchSessions, handleReset]);

  const handleSessionClosed = useCallback(async () => {
    fetchSessions();
    if (selectedSessionId) {
      const data = await getCollaborativeData(selectedSessionId);
      setCollaborativeData(data);
    }
  }, [fetchSessions, selectedSessionId, getCollaborativeData]);

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return {
    // State
    viewMode,
    selectedVendor,
    selectedSessionId,
    collaborativeData,
    sessions,
    selectedSession,
    isAdmin,
    user,
    
    // Actions
    handleStartIndividual,
    handleSessionCreated,
    handleJoinSession,
    handleVendorSelect,
    handleReset,
    handleCollaborativeSave,
    handleSessionDeleted,
    handleSessionClosed,
  };
};