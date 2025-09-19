import { StockFilters } from '@/hooks/useStockData';

// Storage configuration
const STORAGE_KEY = 'stock-on-hand-filters';
const CURRENT_VERSION = 1;

// Extended interface for persisted data with versioning
export interface PersistedStockFilters extends StockFilters {
  version: number;
  timestamp: number; // For potential expiry in the future
}

// Default filter values
export const DEFAULT_STOCK_FILTERS: StockFilters = {
  hideZeroStock: false,
  showOnlyCriticalAndLow: false,
  showOnlyPricelist: false
};

/**
 * Save stock filters to localStorage with error handling
 */
export const saveStockFilters = (filters: StockFilters): void => {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== STOCK FILTERS: localStorage not available for saving ===');
      return;
    }

    const persistedData: PersistedStockFilters = {
      ...filters,
      version: CURRENT_VERSION,
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
    console.log('=== STOCK FILTERS: Filters saved successfully ===', filters);
  } catch (error) {
    console.error('=== STOCK FILTERS: Error saving filters ===', error);
    // Silently fail - user experience should not be affected
  }
};

/**
 * Load stock filters from localStorage with validation and error handling
 */
export const loadStockFilters = (): StockFilters | null => {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== STOCK FILTERS: localStorage not available for loading ===');
      return null;
    }

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      console.log('=== STOCK FILTERS: No stored filters found ===');
      return null;
    }

    const parsedData = JSON.parse(storedData) as PersistedStockFilters;
    
    // Validate the data structure and version
    if (!isValidStoredFilters(parsedData)) {
      console.warn('=== STOCK FILTERS: Invalid stored data, using defaults ===');
      clearStockFilters(); // Clean up invalid data
      return null;
    }

    // Handle version migrations if needed
    const migratedFilters = migrateFiltersIfNeeded(parsedData);
    
    console.log('=== STOCK FILTERS: Filters loaded successfully ===', migratedFilters);
    return migratedFilters;
  } catch (error) {
    console.error('=== STOCK FILTERS: Error loading filters ===', error);
    // Try to clear potentially corrupted data
    clearStockFilters();
    return null;
  }
};

/**
 * Clear stored stock filters
 */
export const clearStockFilters = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== STOCK FILTERS: localStorage not available for clearing ===');
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    console.log('=== STOCK FILTERS: Filters cleared successfully ===');
  } catch (error) {
    console.error('=== STOCK FILTERS: Error clearing filters ===', error);
  }
};

/**
 * Validate stored filter data structure
 */
const isValidStoredFilters = (data: any): data is PersistedStockFilters => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required fields exist and have correct types
  const requiredFields = [
    'hideZeroStock',
    'showOnlyCriticalAndLow', 
    'showOnlyPricelist',
    'version',
    'timestamp'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      return false;
    }
  }

  // Validate boolean fields
  if (
    typeof data.hideZeroStock !== 'boolean' ||
    typeof data.showOnlyCriticalAndLow !== 'boolean' ||
    typeof data.showOnlyPricelist !== 'boolean'
  ) {
    return false;
  }

  // Validate version and timestamp
  if (
    typeof data.version !== 'number' ||
    typeof data.timestamp !== 'number' ||
    data.version < 1
  ) {
    return false;
  }

  return true;
};

/**
 * Handle version migrations for stored filter data
 */
const migrateFiltersIfNeeded = (data: PersistedStockFilters): StockFilters => {
  // Currently no migrations needed, but this function is ready for future schema changes
  if (data.version === CURRENT_VERSION) {
    // Return only the filter fields, not the metadata
    return {
      hideZeroStock: data.hideZeroStock,
      showOnlyCriticalAndLow: data.showOnlyCriticalAndLow,
      showOnlyPricelist: data.showOnlyPricelist
    };
  }

  // Future version migrations would go here
  console.warn(`=== STOCK FILTERS: Unknown version ${data.version}, using current structure ===`);
  
  // Extract known fields and apply defaults for any missing ones
  return {
    hideZeroStock: data.hideZeroStock ?? DEFAULT_STOCK_FILTERS.hideZeroStock,
    showOnlyCriticalAndLow: data.showOnlyCriticalAndLow ?? DEFAULT_STOCK_FILTERS.showOnlyCriticalAndLow,
    showOnlyPricelist: data.showOnlyPricelist ?? DEFAULT_STOCK_FILTERS.showOnlyPricelist
  };
};

/**
 * Check if localStorage is available and working
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    // Test write and read
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage info for debugging
 */
export const getStorageInfo = () => {
  return {
    isAvailable: isLocalStorageAvailable(),
    storageKey: STORAGE_KEY,
    currentVersion: CURRENT_VERSION,
    hasStoredData: !!loadStockFilters()
  };
};