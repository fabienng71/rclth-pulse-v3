
import { CustomTheme } from './types';

// Apply custom theme
export const applyCustomTheme = (theme: CustomTheme) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--foreground', theme.foreground);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--muted', theme.muted);
  root.style.setProperty('--border', theme.border);
  
  // Apply theme class
  root.setAttribute('data-theme', 'custom');
  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Reset custom theme
export const resetCustomTheme = () => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const customProperties = [
    '--background', '--foreground', '--primary', '--secondary',
    '--accent', '--muted', '--border'
  ];
  
  customProperties.forEach(prop => {
    root.style.removeProperty(prop);
  });
  
  root.removeAttribute('data-theme');
};

// Ensure theme class and attributes are set
export const ensureThemeClassAndAttributes = (theme: string) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove all theme attributes first
  root.removeAttribute('data-theme');
  
  // Set appropriate theme
  if (theme === 'crimson') {
    root.setAttribute('data-theme', 'crimson');
  } else if (theme === 'wedgewood') {
    root.setAttribute('data-theme', 'wedgewood');
  } else if (theme === 'eucalyptus') {
    root.setAttribute('data-theme', 'eucalyptus');
  } else if (theme === 'retro') {
    root.setAttribute('data-theme', 'retro');
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  }
};

// Apply crimson theme
export const applyCrimsonTheme = (isDark: boolean = false) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.setAttribute('data-theme', 'crimson');
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply wedgewood theme
export const applyWedgewoodTheme = (isDark: boolean = false) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.setAttribute('data-theme', 'wedgewood');
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply eucalyptus theme
export const applyEucalyptusTheme = (isDark: boolean = false) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.setAttribute('data-theme', 'eucalyptus');
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply retro theme
export const applyRetroTheme = (isDark: boolean = false) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.setAttribute('data-theme', 'retro');
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply original theme
export const applyOriginalTheme = () => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  root.classList.remove('dark');
};
