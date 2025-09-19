import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DashboardSettings, 
  saveDashboardSettings, 
  loadDashboardSettings, 
  DEFAULT_DASHBOARD_SETTINGS,
  isLocalStorageAvailable 
} from '@/utils/dashboardSettingsStorage';

// Debounce delay for localStorage writes (in milliseconds)
const SAVE_DEBOUNCE_DELAY = 500;

/**
 * Custom hook for persisting dashboard settings in localStorage
 * Provides the same API as useState but with automatic persistence
 */
export const usePersistedDashboardSettings = (): [DashboardSettings, (settings: DashboardSettings) => void, boolean] => {
  // Add loading state to track hydration
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize state from localStorage or use defaults
  const [settings, setSettingsState] = useState<DashboardSettings>(() => {
    // Always start with defaults during SSR and initial client render
    return DEFAULT_DASHBOARD_SETTINGS;
  });

  // Ref to store the debounce timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to track if we've already logged the localStorage availability
  const hasLoggedStorageStatus = useRef(false);

  // Log localStorage availability once on mount
  useEffect(() => {
    if (!hasLoggedStorageStatus.current) {
      const isAvailable = isLocalStorageAvailable();
      console.log(`=== DASHBOARD SETTINGS HOOK: localStorage ${isAvailable ? 'available' : 'not available'} ===`);
      hasLoggedStorageStatus.current = true;
    }
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((settingsToSave: DashboardSettings) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveDashboardSettings(settingsToSave);
      saveTimeoutRef.current = null;
    }, SAVE_DEBOUNCE_DELAY);
  }, []);

  // Enhanced setSettings function that persists to localStorage
  const setSettings = useCallback((newSettings: DashboardSettings) => {
    // Update React state immediately for responsive UI
    setSettingsState(newSettings);
    
    // Debounce the localStorage save to prevent excessive writes
    debouncedSave(newSettings);
  }, [debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle hydration issues in SSR environments
  useEffect(() => {
    // On client-side mount, load from localStorage
    if (typeof window !== 'undefined') {
      const loadedSettings = loadDashboardSettings();
      if (loadedSettings) {
        console.log('=== DASHBOARD SETTINGS HOOK: Hydrating with stored settings ===', loadedSettings);
        setSettingsState(loadedSettings);
      }
      setIsLoaded(true);
    }
  }, []);

  return [settings, setSettings, isLoaded] as const;
};