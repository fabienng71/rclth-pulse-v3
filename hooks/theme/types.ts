// Types for theme management

// Base theme types
export type ThemeColor = 'red' | 'blue' | 'purple' | 'crimson' | 'wedgewood' | 'eucalyptus' | 'retro';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeType = ThemeMode | ThemeColor | 'custom' | 'original';

// Custom theme structure
export interface CustomTheme {
  id: string;
  name: string;
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  border: string;
  isDark: boolean;
}

// Default theme templates
export const defaultLightThemeColors = {
  background: '#ffffff',
  foreground: '#020817',
  primary: '#e11d48',
  secondary: '#f1f5f9',
  accent: '#f1f5f9',
  muted: '#f1f5f9',
  border: '#e2e8f0',
};

export const defaultDarkThemeColors = {
  background: '#1a0f0f',
  foreground: '#f8fafc',
  primary: '#e11d48',
  secondary: '#1e293b',
  accent: '#1e293b',
  muted: '#1e293b',
  border: '#1e293b',
};

// Crimson theme templates
export const crimsonLightThemeColors = {
  background: '#ffffff',
  foreground: '#020817',
  primary: '#f30b40',
  secondary: '#fff0f1',
  accent: '#ffe1e4',
  muted: '#ffc8d0',
  border: '#ff9caa',
};

export const crimsonDarkThemeColors = {
  background: '#530017',
  foreground: '#fff0f1',
  primary: '#ff2e55',
  secondary: '#930834',
  accent: '#ac0534',
  muted: '#d40237',
  border: '#ff647d',
};

// Wedgewood theme templates
export const wedgewoodLightThemeColors = {
  background: '#ffffff',
  foreground: '#1b2936',
  primary: '#4d82a3',
  secondary: '#e9eff5',
  accent: '#cedee9',
  muted: '#a3c2d6',
  border: '#71a1bf',
};

export const wedgewoodDarkThemeColors = {
  background: '#1b2936',
  foreground: '#f4f7fb',
  primary: '#71a1bf',
  secondary: '#293f51',
  accent: '#2d4a5f',
  muted: '#325672',
  border: '#3d6b8c',
};

// Eucalyptus theme templates
export const eucalyptusLightThemeColors = {
  background: '#ffffff',
  foreground: '#0f4536',
  primary: '#24a577',
  secondary: '#eefbf5',
  accent: '#d6f5e4',
  muted: '#b0eace',
  border: '#7cd9b2',
};

export const eucalyptusDarkThemeColors = {
  background: '#07271e',
  foreground: '#eefbf5',
  primary: '#47c091',
  secondary: '#0f4536',
  accent: '#11543f',
  muted: '#126a4f',
  border: '#189068',
};

// Retro theme templates
export const retroLightThemeColors = {
  background: '#f1f0e4',
  foreground: '#3e3f29',
  primary: '#7d8d86',
  secondary: '#f1f0e4',
  accent: '#bca88d',
  muted: '#bca88d',
  border: '#7d8d86',
};

export const retroDarkThemeColors = {
  background: '#3e3f29',
  foreground: '#f1f0e4',
  primary: '#bca88d',
  secondary: '#3e3f29',
  accent: '#7d8d86',
  muted: '#7d8d86',
  border: '#bca88d',
};

// Storage keys
export const CUSTOM_THEMES_STORAGE_KEY = 'custom-themes';
export const ACTIVE_CUSTOM_THEME_KEY = 'active-custom-theme';
export const USER_THEME_PREFERENCE_KEY = 'user-theme-preference';
