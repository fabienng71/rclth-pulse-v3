
/**
 * Utility functions for managing the default logo in local storage
 */

// Key for storing the logo path in local storage
const LOGO_STORAGE_KEY = 'default_quotation_logo';

/**
 * Save the selected logo path to local storage
 */
export const saveDefaultLogo = (logoPath: string): void => {
  localStorage.setItem(LOGO_STORAGE_KEY, logoPath);
};

/**
 * Get the default logo path from local storage
 */
export const getDefaultLogo = (): string | null => {
  return localStorage.getItem(LOGO_STORAGE_KEY);
};
