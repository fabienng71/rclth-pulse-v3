// Dashboard settings interfaces
export interface DashboardSettings {
  showCreditMemoDetails: boolean;
  fromDate: string;
  toDate: string;
}

// Storage configuration
const STORAGE_KEY = 'dashboard-revenue-settings';
const CURRENT_VERSION = 3;

// Extended interface for persisted data with versioning
export interface PersistedDashboardSettings extends DashboardSettings {
  version: number;
  timestamp: number;
}

// Default setting values
export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  showCreditMemoDetails: true,
  fromDate: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1).toISOString(),
  toDate: new Date().toISOString()
};

/**
 * Save dashboard settings to localStorage with error handling
 */
export const saveDashboardSettings = (settings: DashboardSettings): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== DASHBOARD SETTINGS: localStorage not available for saving ===');
      return;
    }

    const persistedData: PersistedDashboardSettings = {
      ...settings,
      version: CURRENT_VERSION,
      timestamp: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
    console.log('=== DASHBOARD SETTINGS: Settings saved successfully ===', settings);
  } catch (error) {
    console.error('=== DASHBOARD SETTINGS: Error saving settings ===', error);
  }
};

/**
 * Load dashboard settings from localStorage with validation and error handling
 */
export const loadDashboardSettings = (): DashboardSettings | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== DASHBOARD SETTINGS: localStorage not available for loading ===');
      return null;
    }

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      console.log('=== DASHBOARD SETTINGS: No stored settings found ===');
      return null;
    }

    const parsedData = JSON.parse(storedData) as PersistedDashboardSettings;
    
    if (!isValidStoredSettings(parsedData)) {
      console.warn('=== DASHBOARD SETTINGS: Invalid stored data, using defaults ===');
      clearDashboardSettings();
      return null;
    }

    const migratedSettings = migrateSettingsIfNeeded(parsedData);
    
    console.log('=== DASHBOARD SETTINGS: Settings loaded successfully ===', migratedSettings);
    return migratedSettings;
  } catch (error) {
    console.error('=== DASHBOARD SETTINGS: Error loading settings ===', error);
    clearDashboardSettings();
    return null;
  }
};

/**
 * Clear stored dashboard settings
 */
export const clearDashboardSettings = (): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== DASHBOARD SETTINGS: localStorage not available for clearing ===');
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    console.log('=== DASHBOARD SETTINGS: Settings cleared successfully ===');
  } catch (error) {
    console.error('=== DASHBOARD SETTINGS: Error clearing settings ===', error);
  }
};

/**
 * Validate stored settings data structure
 */
const isValidStoredSettings = (data: any): data is PersistedDashboardSettings => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = [
    'showCreditMemoDetails',
    'fromDate',
    'toDate',
    'version',
    'timestamp'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      return false;
    }
  }

  if (
    typeof data.showCreditMemoDetails !== 'boolean' ||
    typeof data.fromDate !== 'string' ||
    typeof data.toDate !== 'string'
  ) {
    return false;
  }

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
 * Handle version migrations for stored settings data
 */
const migrateSettingsIfNeeded = (data: PersistedDashboardSettings): DashboardSettings => {
  if (data.version === CURRENT_VERSION) {
    return {
      showCreditMemoDetails: data.showCreditMemoDetails,
      fromDate: data.fromDate,
      toDate: data.toDate
    };
  }

  // Handle migration from version 2 (old toggles) to version 3 (simplified)
  if (data.version === 2 || data.version === 1) {
    console.log(`=== DASHBOARD SETTINGS: Migrating from v${data.version} to v3 (simplified toggles) ===`);
    return {
      showCreditMemoDetails: DEFAULT_DASHBOARD_SETTINGS.showCreditMemoDetails,
      fromDate: (data as any).fromDate || DEFAULT_DASHBOARD_SETTINGS.fromDate,
      toDate: (data as any).toDate || DEFAULT_DASHBOARD_SETTINGS.toDate
    };
  }

  console.warn(`=== DASHBOARD SETTINGS: Unknown version ${data.version}, using defaults ===`);
  return DEFAULT_DASHBOARD_SETTINGS;
};

/**
 * Check if localStorage is available and working
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};