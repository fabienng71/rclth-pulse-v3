import { useState, useEffect, useCallback, useRef } from 'react';
import { StockFilters } from './useStockData';
import { 
  saveStockFilters, 
  loadStockFilters, 
  DEFAULT_STOCK_FILTERS,
  isLocalStorageAvailable 
} from '@/utils/stockFilterStorage';

// Debounce delay for localStorage writes (in milliseconds)
const SAVE_DEBOUNCE_DELAY = 500;

/**
 * Custom hook for persisting stock filters in localStorage
 * Provides the same API as useState but with automatic persistence
 */
export const usePersistedStockFilters = (): [StockFilters, (filters: StockFilters) => void] => {
  // Initialize state from localStorage or use defaults
  const [filters, setFiltersState] = useState<StockFilters>(() => {
    // Only try to load from localStorage on client side
    if (typeof window === 'undefined') {
      return DEFAULT_STOCK_FILTERS;
    }

    const loadedFilters = loadStockFilters();
    return loadedFilters || DEFAULT_STOCK_FILTERS;
  });

  // Ref to store the debounce timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref to track if we've already logged the localStorage availability
  const hasLoggedStorageStatus = useRef(false);

  // Log localStorage availability once on mount
  useEffect(() => {
    if (!hasLoggedStorageStatus.current) {
      const isAvailable = isLocalStorageAvailable();
      console.log(`=== STOCK FILTERS HOOK: localStorage ${isAvailable ? 'available' : 'not available'} ===`);
      hasLoggedStorageStatus.current = true;
    }
  }, []);

  // Debounced save function
  const debouncedSave = useCallback((filtersToSave: StockFilters) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveStockFilters(filtersToSave);
      saveTimeoutRef.current = null;
    }, SAVE_DEBOUNCE_DELAY);
  }, []);

  // Enhanced setFilters function that persists to localStorage
  const setFilters = useCallback((newFilters: StockFilters) => {
    // Update React state immediately for responsive UI
    setFiltersState(newFilters);
    
    // Debounce the localStorage save to prevent excessive writes
    debouncedSave(newFilters);
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
    // On client-side mount, double-check if we need to load from localStorage
    // This handles cases where SSR rendered with defaults but client has stored data
    if (typeof window !== 'undefined') {
      const loadedFilters = loadStockFilters();
      if (loadedFilters) {
        // Only update if the loaded filters are different from current state
        const currentFiltersString = JSON.stringify(filters);
        const loadedFiltersString = JSON.stringify(loadedFilters);
        
        if (currentFiltersString !== loadedFiltersString) {
          console.log('=== STOCK FILTERS HOOK: Hydrating with stored filters ===');
          setFiltersState(loadedFilters);
        }
      }
    }
  }, []); // Empty dependency array - only run once on mount

  return [filters, setFilters] as const;
};

/**
 * Hook to reset filters to defaults and clear localStorage
 */
export const useResetStockFilters = () => {
  return useCallback(() => {
    // Clear from localStorage
    if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
      try {
        localStorage.removeItem('stock-on-hand-filters');
        console.log('=== STOCK FILTERS: Reset to defaults and cleared storage ===');
      } catch (error) {
        console.error('=== STOCK FILTERS: Error clearing storage during reset ===', error);
      }
    }
    
    return DEFAULT_STOCK_FILTERS;
  }, []);
};

/**
 * Hook to get filter storage debug information
 */
export const useStockFilterDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    isLocalStorageAvailable: false,
    hasStoredData: false,
    currentFilters: DEFAULT_STOCK_FILTERS,
    storageKey: 'stock-on-hand-filters'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAvailable = isLocalStorageAvailable();
      const storedFilters = loadStockFilters();
      
      setDebugInfo({
        isLocalStorageAvailable: isAvailable,
        hasStoredData: !!storedFilters,
        currentFilters: storedFilters || DEFAULT_STOCK_FILTERS,
        storageKey: 'stock-on-hand-filters'
      });
    }
  }, []);

  return debugInfo;
};