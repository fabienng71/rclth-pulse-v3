
import { CustomTheme, CUSTOM_THEMES_STORAGE_KEY, ACTIVE_CUSTOM_THEME_KEY } from './types';

// Save custom themes to localStorage with error handling
export const saveCustomThemes = (themes: CustomTheme[]): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== THEME STORAGE: localStorage not available ===');
      return;
    }
    
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(themes));
    console.log('=== THEME STORAGE: Custom themes saved successfully ===', themes.length);
  } catch (error) {
    console.error('=== THEME STORAGE: Error saving custom themes ===', error);
  }
};

// Get custom themes from localStorage with error handling
export const getCustomThemes = (): CustomTheme[] => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== THEME STORAGE: localStorage not available for reading ===');
      return [];
    }
    
    const storedThemes = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY);
    if (storedThemes) {
      const themes = JSON.parse(storedThemes);
      console.log('=== THEME STORAGE: Custom themes loaded ===', themes.length);
      return themes;
    }
  } catch (error) {
    console.error('=== THEME STORAGE: Error loading custom themes ===', error);
  }
  return [];
};

// Save active custom theme ID to localStorage with error handling
export const saveActiveCustomTheme = (themeId: string | null): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== THEME STORAGE: localStorage not available for saving active theme ===');
      return;
    }
    
    if (themeId) {
      localStorage.setItem(ACTIVE_CUSTOM_THEME_KEY, themeId);
      console.log('=== THEME STORAGE: Active custom theme saved ===', themeId);
    } else {
      localStorage.removeItem(ACTIVE_CUSTOM_THEME_KEY);
      console.log('=== THEME STORAGE: Active custom theme cleared ===');
    }
  } catch (error) {
    console.error('=== THEME STORAGE: Error saving active custom theme ===', error);
  }
};

// Get active custom theme ID from localStorage with error handling
export const getActiveCustomTheme = (): string | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('=== THEME STORAGE: localStorage not available for reading active theme ===');
      return null;
    }
    
    const activeTheme = localStorage.getItem(ACTIVE_CUSTOM_THEME_KEY);
    console.log('=== THEME STORAGE: Active custom theme loaded ===', activeTheme);
    return activeTheme;
  } catch (error) {
    console.error('=== THEME STORAGE: Error loading active custom theme ===', error);
    return null;
  }
};
